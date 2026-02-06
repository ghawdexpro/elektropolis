import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderShippedNotification } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  // Verify admin auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get order details
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_email, shipping_address, status"
    )
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const trackingNote = body.trackingNote as string | undefined;
  const addr = order.shipping_address as Record<string, string> | null;

  const result = await sendOrderShippedNotification({
    orderNumber: order.order_number,
    customerEmail: order.customer_email,
    customerName: addr?.name || order.customer_email,
    trackingNote,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
