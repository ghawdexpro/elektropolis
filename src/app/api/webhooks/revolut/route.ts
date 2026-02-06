import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyRevolutWebhook } from "@/lib/revolut";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader =
      request.headers.get("Revolut-Signature") || "";
    const timestampHeader =
      request.headers.get("Revolut-Request-Timestamp") || "";

    // Verify webhook signature
    if (process.env.REVOLUT_WEBHOOK_SECRET) {
      const isValid = await verifyRevolutWebhook(
        rawBody,
        signatureHeader,
        timestampHeader
      );
      if (!isValid) {
        console.error("Invalid Revolut webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const orderId = event.order_id;
    const merchantRef = event.merchant_order_ext_ref;

    console.log(`Revolut webhook: ${eventType} for order ${orderId}`);

    const supabase = createAdminClient();

    if (eventType === "ORDER_COMPLETED") {
      // Find order by revolut_order_id or merchant_order_ext_ref
      const identifier = merchantRef || orderId;
      const column = merchantRef ? "id" : "revolut_order_id";

      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          status: "confirmed",
        })
        .eq(column, identifier);

      if (error) {
        console.error("Failed to update order payment status:", error);
        // Still return 200 so Revolut doesn't retry
      }

      // Send order confirmation email
      if (!error) {
        try {
          const { data: orderData } = await supabase
            .from("orders")
            .select(
              `
              id, order_number, customer_email, subtotal, shipping_cost, total,
              shipping_address,
              order_items (title, quantity, price, image_url)
            `
            )
            .eq(column, identifier)
            .single();

          if (orderData) {
            const addr = orderData.shipping_address as Record<string, string> | null;
            await sendOrderConfirmation({
              orderNumber: orderData.order_number,
              customerEmail: orderData.customer_email,
              customerName: addr?.name || orderData.customer_email,
              items: orderData.order_items || [],
              subtotal: orderData.subtotal,
              shippingCost: orderData.shipping_cost,
              total: orderData.total,
              shippingAddress: {
                name: addr?.name || "",
                line1: addr?.line1 || "",
                line2: addr?.line2,
                city: addr?.city || "",
                postalCode: addr?.postalCode || "",
                country: addr?.country || "Malta",
              },
            });
          }
        } catch (emailErr) {
          console.error("Failed to send order confirmation email:", emailErr);
        }
      }
    } else if (
      eventType === "ORDER_CANCELLED" ||
      eventType === "ORDER_PAYMENT_FAILED"
    ) {
      const identifier = merchantRef || orderId;
      const column = merchantRef ? "id" : "revolut_order_id";

      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq(column, identifier);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Revolut webhook error:", err);
    return NextResponse.json({ received: true });
  }
}
