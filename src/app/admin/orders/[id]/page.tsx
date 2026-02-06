"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Package,
  Mail,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  CreditCard,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  product_id: string | null;
  title: string;
  sku: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface ShippingAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

interface Order {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_email: string;
  customer_phone: string | null;
  status: string;
  payment_status: string;
  revolut_order_id: string | null;
  paid_at: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress | null;
  billing_address: ShippingAddress | null;
  notes: string | null;
  created_at: string;
}

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  const loadOrder = useCallback(async () => {
    setLoading(true);
    const [orderRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)
        .order("id"),
    ]);

    if (orderRes.error || !orderRes.data) {
      setMessage({ type: "error", text: "Order not found." });
      setLoading(false);
      return;
    }

    setOrder(orderRes.data as Order);
    setItems((itemsRes.data as OrderItem[]) ?? []);
    setLoading(false);
  }, [orderId, supabase]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    setMessage(null);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      setMessage({
        type: "error",
        text: `Failed to update status: ${error.message}`,
      });
    } else {
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      setMessage({ type: "success", text: `Order status updated to ${newStatus}.` });
    }
    setUpdating(false);
  };

  const handlePaymentStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    setMessage(null);

    const updateData: Record<string, unknown> = { payment_status: newStatus };
    if (newStatus === "paid" && !order.paid_at) {
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      setMessage({
        type: "error",
        text: `Failed to update payment status: ${error.message}`,
      });
    } else {
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              payment_status: newStatus,
              paid_at:
                newStatus === "paid" && !prev.paid_at
                  ? new Date().toISOString()
                  : prev.paid_at,
            }
          : null
      );
      setMessage({
        type: "success",
        text: `Payment status updated to ${newStatus}.`,
      });
    }
    setUpdating(false);
  };

  const handleSendShippingEmail = async () => {
    if (!order) return;
    setSendingEmail(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({
          type: "error",
          text: data.error || "Failed to send notification",
        });
      } else {
        setMessage({
          type: "success",
          text: "Shipping notification sent to customer.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send notification" });
    }
    setSendingEmail(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Order not found.</p>
        <Link href="/admin/orders" className="text-brand text-sm mt-2 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const shippingAddr = order.shipping_address;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg hover:bg-white border border-border transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">
              Order #{order.order_number}
            </h1>
            <p className="text-muted text-sm mt-0.5">
              {new Date(order.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Status and info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Order status */}
        <div className="bg-white rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wide">
            Order Status
          </h3>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Update Status
            </label>
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={updating}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white disabled:opacity-50"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {(order.status === "shipped" || order.status === "delivered") && (
            <button
              onClick={handleSendShippingEmail}
              disabled={sendingEmail}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {sendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Shipping Email
            </button>
          )}
        </div>

        {/* Payment status */}
        <div className="bg-white rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wide">
            Payment
          </h3>
          <div className="flex items-center gap-2">
            <PaymentStatusBadge status={order.payment_status} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Update Payment Status
            </label>
            <select
              value={order.payment_status}
              onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
              disabled={updating}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white disabled:opacity-50"
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {order.revolut_order_id && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted">
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Revolut: {order.revolut_order_id}</span>
              </div>
              {order.paid_at && (
                <p className="text-xs text-muted mt-1">
                  Paid:{" "}
                  {new Date(order.paid_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-xl border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wide">
            Customer
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-charcoal">
              <Mail className="w-4 h-4 text-muted shrink-0" />
              <span className="truncate">{order.customer_email}</span>
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2 text-charcoal">
                <Phone className="w-4 h-4 text-muted shrink-0" />
                {order.customer_phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-charcoal">Order Items</h2>
        </div>
        {items.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted">
            No items in this order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left bg-surface/50">
                  <th className="px-6 py-3 font-medium text-muted w-12"></th>
                  <th className="px-6 py-3 font-medium text-muted">Item</th>
                  <th className="px-6 py-3 font-medium text-muted">SKU</th>
                  <th className="px-6 py-3 font-medium text-muted text-right">
                    Price
                  </th>
                  <th className="px-6 py-3 font-medium text-muted text-center">
                    Qty
                  </th>
                  <th className="px-6 py-3 font-medium text-muted text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded-lg border border-border overflow-hidden bg-surface flex items-center justify-center">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-muted" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-charcoal">
                      {item.title}
                    </td>
                    <td className="px-6 py-3 text-muted font-mono text-xs">
                      {item.sku ?? "-"}
                    </td>
                    <td className="px-6 py-3 text-right text-charcoal">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-3 text-center text-charcoal">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary and shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order summary */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-charcoal">
            Order Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="text-charcoal">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className="text-charcoal">
                {order.shipping_cost > 0
                  ? formatPrice(order.shipping_cost)
                  : "Free"}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-charcoal">Total</span>
              <span className="font-bold text-charcoal text-lg">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-charcoal">
            Shipping Address
          </h3>
          {shippingAddr ? (
            <div className="flex items-start gap-3 text-sm text-charcoal">
              <MapPin className="w-4 h-4 text-muted mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                {shippingAddr.name && (
                  <p className="font-medium">{shippingAddr.name}</p>
                )}
                {shippingAddr.line1 && <p>{shippingAddr.line1}</p>}
                {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
                <p>
                  {[shippingAddr.city, shippingAddr.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {shippingAddr.country && <p>{shippingAddr.country}</p>}
                {shippingAddr.phone && (
                  <p className="text-muted mt-1">{shippingAddr.phone}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">No shipping address provided.</p>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl border border-border p-6 space-y-3">
          <h3 className="text-lg font-semibold text-charcoal">
            Order Notes
          </h3>
          <p className="text-sm text-charcoal whitespace-pre-wrap">
            {order.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-orange-50 text-orange-700 border-orange-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] ?? "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    refunded: "bg-red-50 text-red-700 border-red-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] ?? "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
