import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  CircleDot,
  XCircle,
  Receipt,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Details | ElektroPolis",
  description: "View the details of your ElektroPolis order.",
};

/* ── Status config ───────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CircleDot,
  },
  shipped: {
    label: "Shipped",
    className: "bg-brand-light text-brand border-brand/20",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {config.label}
    </span>
  );
}

/* ── Page ────────────────────────────────────────────────── */
interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch the order
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .single();

  if (!order) notFound();

  // Fetch order items
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  const orderDate = new Date(order.created_at).toLocaleDateString("en-MT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const orderTime = new Date(order.created_at).toLocaleTimeString("en-MT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const orderNumber =
    order.order_number ||
    `#${String(order.id).slice(0, 8).toUpperCase()}`;

  // Parse shipping address (could be JSON or string)
  let shippingAddress: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  } | null = null;

  if (order.shipping_address) {
    if (typeof order.shipping_address === "string") {
      try {
        shippingAddress = JSON.parse(order.shipping_address);
      } catch {
        shippingAddress = { line1: order.shipping_address };
      }
    } else {
      shippingAddress = order.shipping_address;
    }
  }

  const subtotal = order.subtotal ?? order.total - (order.shipping_cost ?? 0);
  const shippingCost = order.shipping_cost ?? 0;

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10 md:py-14">
      {/* ── Breadcrumbs ──────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-8">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href="/account"
          className="hover:text-charcoal transition-colors"
        >
          My Account
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href="/account/orders"
          className="hover:text-charcoal transition-colors"
        >
          Orders
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-medium">{orderNumber}</span>
      </nav>

      {/* ── Back Link ────────────────────────────────────── */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-muted hover:text-charcoal transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* ── Order Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] md:text-[32px] font-bold text-charcoal tracking-tight mb-1">
            Order {orderNumber}
          </h1>
          <p className="text-[14px] text-muted">
            Placed on {orderDate} at {orderTime}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ── Left Column: Order Items ───────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface">
              <Package className="w-4.5 h-4.5 text-muted" strokeWidth={1.5} />
              <h2 className="text-[15px] font-semibold text-charcoal">
                Order Items
                {items && items.length > 0 && (
                  <span className="text-muted font-normal ml-1.5">
                    ({items.length} item{items.length === 1 ? "" : "s"})
                  </span>
                )}
              </h2>
            </div>

            <div className="divide-y divide-border">
              {items && items.length > 0 ? (
                items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex gap-4 p-5 md:p-6"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-surface border border-border overflow-hidden shrink-0">
                      {item.image_url || item.product_image ? (
                        <Image
                          src={item.image_url || item.product_image}
                          alt={item.product_title || item.title || "Product"}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package
                            className="w-8 h-8 text-border"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-charcoal mb-1 truncate">
                        {item.product_title || item.title || "Product"}
                      </h3>
                      {(item.variant_title || item.variant) && (
                        <p className="text-[13px] text-muted mb-2">
                          {item.variant_title || item.variant}
                        </p>
                      )}
                      <p className="text-[13px] text-muted">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-semibold text-charcoal">
                        {formatPrice(
                          (item.unit_price || item.price) * item.quantity
                        )}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[12px] text-muted mt-0.5">
                          {formatPrice(item.unit_price || item.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-[14px] text-muted">
                    No item details available for this order.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Summary & Shipping ───────────── */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface">
              <Receipt
                className="w-4.5 h-4.5 text-muted"
                strokeWidth={1.5}
              />
              <h2 className="text-[15px] font-semibold text-charcoal">
                Order Summary
              </h2>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-muted">Subtotal</span>
                <span className="text-charcoal font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[14px]">
                <span className="text-muted">Shipping</span>
                <span className="text-charcoal font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-success font-semibold">Free</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>

              {order.discount_amount != null && order.discount_amount > 0 && (
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-muted">Discount</span>
                  <span className="text-success font-medium">
                    -{formatPrice(order.discount_amount)}
                  </span>
                </div>
              )}

              <div className="h-px bg-border my-1" />

              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-charcoal">
                  Total
                </span>
                <span className="text-[18px] font-bold text-charcoal">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface">
                <MapPin
                  className="w-4.5 h-4.5 text-muted"
                  strokeWidth={1.5}
                />
                <h2 className="text-[15px] font-semibold text-charcoal">
                  Shipping Address
                </h2>
              </div>

              <div className="p-6">
                <div className="text-[14px] text-charcoal leading-relaxed space-y-0.5">
                  {shippingAddress.name && (
                    <p className="font-medium">{shippingAddress.name}</p>
                  )}
                  {shippingAddress.line1 && <p>{shippingAddress.line1}</p>}
                  {shippingAddress.line2 && (
                    <p className="text-muted">{shippingAddress.line2}</p>
                  )}
                  {(shippingAddress.city || shippingAddress.postal_code) && (
                    <p>
                      {[shippingAddress.city, shippingAddress.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {shippingAddress.country && (
                    <p className="text-muted">{shippingAddress.country}</p>
                  )}
                  {shippingAddress.phone && (
                    <p className="text-muted mt-2">
                      Tel: {shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Need Help */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-[14px] font-semibold text-charcoal mb-2">
              Need help with this order?
            </h3>
            <p className="text-[13px] text-muted leading-relaxed mb-4">
              If you have any questions or concerns about your order, our
              support team is here to help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-10 px-5 bg-charcoal hover:bg-charcoal/90 text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
