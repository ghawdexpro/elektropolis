import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  handle: string;
  quantity: number;
  sku?: string;
}

interface CheckoutPayload {
  items: CartItem[];
  email: string;
  phone: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
}

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `EP-${datePart}-${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutPayload = await request.json();

    // ── Validate required fields ──────────────────────
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const { shippingAddress } = body;
    if (
      !shippingAddress ||
      !shippingAddress.name?.trim() ||
      !shippingAddress.line1?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.postalCode?.trim()
    ) {
      return NextResponse.json(
        { error: "Complete shipping address is required" },
        { status: 400 }
      );
    }

    // ── Calculate totals ──────────────────────────────
    const subtotal = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    const orderNumber = generateOrderNumber();

    // ── Check if customer exists by email ─────────────
    const supabase = createAdminClient();

    // Try to find an existing user by email
    const { data: userData } = await supabase.auth.admin.listUsers();
    const existingUser = userData?.users?.find(
      (u) => u.email?.toLowerCase() === body.email.trim().toLowerCase()
    );
    const customerId = existingUser?.id || null;

    // ── Insert order ──────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        customer_email: body.email.trim(),
        customer_phone: body.phone.trim(),
        status: "pending",
        payment_status: "unpaid",
        subtotal,
        shipping_cost: shippingCost,
        total,
        shipping_address: {
          name: shippingAddress.name.trim(),
          line1: shippingAddress.line1.trim(),
          line2: shippingAddress.line2?.trim() || null,
          city: shippingAddress.city.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country || "Malta",
        },
        billing_address: {
          name: shippingAddress.name.trim(),
          line1: shippingAddress.line1.trim(),
          line2: shippingAddress.line2?.trim() || null,
          city: shippingAddress.city.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country || "Malta",
        },
        notes: body.notes?.trim() || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order. Please try again." },
        { status: 500 }
      );
    }

    // ── Insert order items ────────────────────────────
    const orderItems = body.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId || null,
      title: item.title,
      sku: item.sku || null,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
      image_url: item.image || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Failed to create order items:", itemsError);
      // Order was created but items failed - still return the order
      // The admin can fix items manually if needed
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
