"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Package,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/ui/Badge";
import { useToast } from "@/components/admin/ui/Toast";
import { selectStyles } from "@/components/admin/ui/FormField";

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

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase.from("order_items").select("*").eq("order_id", orderId).order("id"),
    ]).then(([orderRes, itemsRes]) => {
      if (orderRes.error || !orderRes.data) {
        toast({ type: "error", message: "Order not found." });
        setLoading(false);
        return;
      }
      setOrder(orderRes.data as Order);
      setItems((itemsRes.data as OrderItem[]) ?? []);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ type: "error", message: `Failed to update status: ${error.message}` });
    } else {
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast({ type: "success", message: `Status updated to ${newStatus}.` });
    }
    setUpdating(false);
  };

  const handlePaymentStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);

    const updateData: Record<string, unknown> = { payment_status: newStatus };
    if (newStatus === "paid" && !order.paid_at) {
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      toast({ type: "error", message: `Failed to update payment: ${error.message}` });
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
      toast({ type: "success", message: `Payment status updated to ${newStatus}.` });
    }
    setUpdating(false);
  };

  const handleSendShippingEmail = async () => {
    if (!order) return;
    setSendingEmail(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({ type: "error", message: data.error || "Failed to send notification" });
      } else {
        toast({ type: "success", message: "Shipping notification sent." });
      }
    } catch {
      toast({ type: "error", message: "Failed to send notification" });
    }
    setSendingEmail(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium text-charcoal">Order not found</p>
        <Link
          href="/admin/orders"
          className="mt-2 inline-block text-sm text-brand hover:text-brand-hover"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const shippingAddr = order.shipping_address;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={`Order #${order.order_number}`}
        subtitle={new Date(order.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        breadcrumbs={[
          { label: "Orders", href: "/admin/orders" },
          { label: `#${order.order_number}` },
        ]}
      />

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Order status */}
        <div className="space-y-4 rounded-xl border border-border bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Order Status
          </h3>
          <div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Update Status
            </label>
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={updating}
              className={selectStyles + " disabled:opacity-50"}
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
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {sendingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Shipping Email
            </button>
          )}
        </div>

        {/* Payment status */}
        <div className="space-y-4 rounded-xl border border-border bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Payment
          </h3>
          <div>
            <PaymentStatusBadge status={order.payment_status} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Update Payment Status
            </label>
            <select
              value={order.payment_status}
              onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
              disabled={updating}
              className={selectStyles + " disabled:opacity-50"}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {order.revolut_order_id && (
            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <CreditCard className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Revolut: {order.revolut_order_id}</span>
              </div>
              {order.paid_at && (
                <p className="mt-1 text-xs text-muted">
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
        <div className="space-y-3 rounded-xl border border-border bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Customer
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-charcoal">
              <Mail className="h-4 w-4 shrink-0 text-muted" />
              <span className="truncate">{order.customer_email}</span>
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2 text-charcoal">
                <Phone className="h-4 w-4 shrink-0 text-muted" />
                {order.customer_phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-charcoal">
            Order Items
          </h2>
        </div>
        {items.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted">
            No items in this order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/30">
                  <th className="w-12 px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted" />
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Item
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    SKU
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Price
                  </th>
                  <th className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                    Qty
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface/30">
                    <td className="px-5 py-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-charcoal">
                      {item.title}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">
                      {item.sku ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-charcoal">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-5 py-3 text-center text-charcoal">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary + Shipping */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Order summary */}
        <div className="space-y-4 rounded-xl border border-border bg-white p-6">
          <h3 className="text-base font-semibold text-charcoal">
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
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold text-charcoal">Total</span>
              <span className="text-lg font-bold text-charcoal">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="space-y-4 rounded-xl border border-border bg-white p-6">
          <h3 className="text-base font-semibold text-charcoal">
            Shipping Address
          </h3>
          {shippingAddr ? (
            <div className="flex items-start gap-3 text-sm text-charcoal">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
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
                  <p className="mt-1 text-muted">{shippingAddr.phone}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">
              No shipping address provided.
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="space-y-3 rounded-xl border border-border bg-white p-6">
          <h3 className="text-base font-semibold text-charcoal">
            Order Notes
          </h3>
          <p className="whitespace-pre-wrap text-sm text-charcoal">
            {order.notes}
          </p>
        </div>
      )}
    </div>
  );
}
