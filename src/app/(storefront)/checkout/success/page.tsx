import Link from "next/link";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import PaymentStatusPoller from "@/components/storefront/PaymentStatusPoller";
import {
  CheckCircle,
  Package,
  MapPin,
  ArrowRight,
  ShoppingBag,
  User,
  Truck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Thank you for your order at ElektroPolis Malta.",
};

interface OrderItem {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; orderId?: string }>;
}) {
  const params = await searchParams;
  const id = params.orderId || params.order;

  let order: Order | null = null;

  if (id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select(
        `
        id, order_number, customer_email, customer_phone, status, payment_status,
        subtotal, shipping_cost, total, shipping_address, notes, created_at,
        order_items (id, title, sku, price, quantity, image_url)
      `
      )
      .eq("id", id)
      .single();

    order = data as Order | null;
  }

  // Generic thank you if no order found
  if (!order) {
    return (
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-16 md:py-24">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle
              className="w-10 h-10 text-success"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="text-[28px] md:text-[34px] font-bold text-charcoal tracking-tight mb-3">
            Thank you for your order!
          </h1>
          <p className="text-[15px] text-muted mb-10 max-w-md mx-auto">
            Your order has been received. We&apos;ll send you a confirmation
            email with the details shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-brand hover:bg-brand-hover text-white text-[15px] font-semibold rounded-lg transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center h-12 px-8 border border-border text-charcoal text-[15px] font-medium rounded-lg hover:bg-surface transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const address = order.shipping_address;
  const orderDate = new Date(order.created_at).toLocaleDateString("en-MT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
      {/* ── Success Header ──────────────────────────────── */}
      <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle
            className="w-10 h-10 text-success"
            strokeWidth={1.5}
          />
        </div>
        <h1 className="text-[28px] md:text-[34px] font-bold text-charcoal tracking-tight mb-2">
          Thank you for your order!
        </h1>
        <p className="text-[15px] text-muted max-w-md mx-auto">
          Order{" "}
          <span className="font-semibold text-charcoal">
            {order.order_number}
          </span>{" "}
          has been placed successfully.
        </p>
      </div>

      {/* Payment Status Polling */}
      <div className="max-w-3xl mx-auto mb-8">
        <PaymentStatusPoller
          orderId={order.id}
          initialStatus={order.payment_status}
        />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* ── Order Info Bar ────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface rounded-xl border border-border p-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted mb-1">
              Order Number
            </p>
            <p className="text-[14px] font-bold text-charcoal">
              {order.order_number}
            </p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted mb-1">
              Date
            </p>
            <p className="text-[14px] font-bold text-charcoal">{orderDate}</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted mb-1">
              Total
            </p>
            <p className="text-[14px] font-bold text-charcoal">
              {formatPrice(order.total)}
            </p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted mb-1">
              Status
            </p>
            <p className="text-[14px] font-bold text-brand capitalize">
              {order.status}
            </p>
          </div>
        </div>

        {/* ── Order Details ─────────────────────────────── */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {/* Items section */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                <Package
                  className="w-4 h-4 text-brand"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-[18px] font-bold text-charcoal">
                Order Items
              </h2>
            </div>

            <div className="divide-y divide-border">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="w-14 h-14 rounded-lg bg-surface overflow-hidden flex-shrink-0 border border-border">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag
                          className="w-4 h-4 text-muted"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-charcoal truncate">
                      {item.title}
                    </p>
                    <p className="text-[12px] text-muted mt-0.5">
                      {item.sku ? `SKU: ${item.sku} · ` : ""}Qty:{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <span className="text-[14px] font-semibold text-charcoal flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border bg-surface/50 px-6 md:px-8 py-5">
            <div className="space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-charcoal">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-muted">Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="flex justify-between text-[16px] pt-2 border-t border-border">
                <span className="font-bold text-charcoal">Total</span>
                <span className="font-bold text-charcoal">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Shipping & Contact ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* Shipping Address */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                <MapPin
                  className="w-4 h-4 text-brand"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-[16px] font-bold text-charcoal">
                Delivery Address
              </h3>
            </div>
            <div className="text-[14px] text-muted leading-relaxed space-y-0.5">
              <p className="font-medium text-charcoal">{address.name}</p>
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}, {address.postalCode}
              </p>
              <p>{address.country}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                <User
                  className="w-4 h-4 text-brand"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-[16px] font-bold text-charcoal">
                Contact Details
              </h3>
            </div>
            <div className="text-[14px] text-muted leading-relaxed space-y-1">
              <p>{order.customer_email}</p>
              <p>{order.customer_phone}</p>
            </div>

            {order.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[12px] uppercase tracking-[0.1em] font-semibold text-muted mb-1">
                  Order Notes
                </p>
                <p className="text-[14px] text-charcoal">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Delivery Notice ──────────────────────────── */}
        <div className="mt-6 bg-brand-light rounded-xl border border-brand/10 p-5 flex items-start gap-4">
          <Truck
            className="w-5 h-5 text-brand flex-shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div>
            <p className="text-[14px] font-semibold text-charcoal mb-1">
              Free delivery across Malta & Gozo
            </p>
            <p className="text-[13px] text-muted">
              Our team will contact you to arrange a convenient delivery time.
            </p>
          </div>
        </div>

        {/* ── Action Buttons ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-brand hover:bg-brand-hover text-white text-[15px] font-semibold rounded-lg transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center h-12 px-8 border border-border text-charcoal text-[15px] font-medium rounded-lg hover:bg-surface transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
