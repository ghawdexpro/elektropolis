import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const orderId = new URL(request.url).searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { error: "orderId is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("payment_status, status")
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    paymentStatus: data.payment_status,
    orderStatus: data.status,
  });
}
