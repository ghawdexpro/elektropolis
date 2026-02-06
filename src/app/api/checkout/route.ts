import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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
    // ── Rate limiting ────────────────────────────────
    const ip = getClientIp(request);
    if (!checkRateLimit(`checkout:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

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

    const supabase = createAdminClient();

    // ── Server-side price validation & inventory check ─
    const productIds = body.items.map((item) => item.productId);
    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, title, price, inventory_count, status, sku")
      .in("id", productIds);

    if (productsError || !dbProducts) {
      console.error("Failed to fetch products:", productsError);
      return NextResponse.json(
        { error: "Failed to verify products. Please try again." },
        { status: 500 }
      );
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Validate each item against database
    for (const item of body.items) {
      const dbProduct = productMap.get(item.productId);

      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product "${item.title}" is no longer available.` },
          { status: 400 }
        );
      }

      if (dbProduct.status !== "active") {
        return NextResponse.json(
          { error: `"${dbProduct.title}" is no longer available.` },
          { status: 400 }
        );
      }

      if (dbProduct.inventory_count < item.quantity) {
        const available = dbProduct.inventory_count;
        return NextResponse.json(
          {
            error:
              available === 0
                ? `"${dbProduct.title}" is out of stock.`
                : `Only ${available} of "${dbProduct.title}" available.`,
          },
          { status: 400 }
        );
      }
    }

    // ── Calculate totals using DB prices (NOT client prices) ─
    const subtotal = body.items.reduce((sum, item) => {
      const dbProduct = productMap.get(item.productId)!;
      return sum + Number(dbProduct.price) * item.quantity;
    }, 0);
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    const orderNumber = generateOrderNumber();

    // ── Find existing customer by email ──────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", body.email.trim().toLowerCase())
      .single();
    const customerId = profile?.id ?? null;

    // ── Insert order ─────────────────────────────────
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

    // ── Insert order items (using DB prices and titles) ─
    const orderItems = body.items.map((item) => {
      const dbProduct = productMap.get(item.productId)!;
      return {
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        title: dbProduct.title,
        sku: dbProduct.sku || null,
        price: Number(dbProduct.price),
        quantity: item.quantity,
        total: Number(dbProduct.price) * item.quantity,
        image_url: item.image || null,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Failed to create order items:", itemsError);
      // Roll back: delete the order since items failed
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order. Please try again." },
        { status: 500 }
      );
    }

    // ── Decrement inventory (optimistic locking) ─────
    for (const item of body.items) {
      const dbProduct = productMap.get(item.productId)!;
      const { error: invError, count } = await supabase
        .from("products")
        .update({
          inventory_count: dbProduct.inventory_count - item.quantity,
        })
        .eq("id", item.productId)
        .eq("inventory_count", dbProduct.inventory_count);

      if (invError || count === 0) {
        // Inventory changed between check and update — race condition.
        // Order is already created, so log but don't fail.
        // Admin can reconcile manually.
        console.warn(
          `Inventory race condition for product ${item.productId}`,
          invError
        );
      }
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
