import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  CircleDot,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Orders | ElektroPolis",
  description: "View and track all your ElektroPolis orders.",
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border ${config.className}`}
    >
      <Icon className="w-3 h-3" strokeWidth={2} />
      {config.label}
    </span>
  );
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

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
        <span className="text-charcoal font-medium">Orders</span>
      </nav>

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] md:text-[36px] font-bold text-charcoal tracking-tight mb-2">
            My Orders
          </h1>
          <p className="text-[15px] text-muted">
            {orders && orders.length > 0
              ? `You have ${orders.length} order${orders.length === 1 ? "" : "s"}`
              : "Track and manage your purchases"}
          </p>
        </div>
        <Link
          href="/account"
          className="hidden sm:inline-flex items-center gap-2 text-[14px] font-medium text-muted hover:text-charcoal transition-colors"
        >
          Back to Account
        </Link>
      </div>

      {/* ── Orders List ──────────────────────────────────── */}
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-[1fr_140px_120px_120px_40px] gap-4 px-6 py-3 text-[12px] font-semibold text-muted uppercase tracking-wider">
            <span>Order</span>
            <span>Date</span>
            <span>Status</span>
            <span className="text-right">Total</span>
            <span></span>
          </div>

          {orders.map((order) => {
            const orderDate = new Date(order.created_at).toLocaleDateString(
              "en-MT",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            );

            const orderNumber =
              order.order_number ||
              `#${String(order.id).slice(0, 8).toUpperCase()}`;

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group block bg-white border border-border hover:border-brand/30 rounded-xl transition-all duration-200 hover:shadow-sm"
              >
                {/* Mobile Layout */}
                <div className="md:hidden p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[15px] font-semibold text-charcoal">
                        {orderNumber}
                      </p>
                      <p className="text-[13px] text-muted mt-0.5">
                        {orderDate}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <p className="text-[15px] font-semibold text-charcoal">
                      {formatPrice(order.total)}
                    </p>
                    <span className="text-[13px] font-medium text-brand flex items-center gap-1">
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-[1fr_140px_120px_120px_40px] gap-4 items-center px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface group-hover:bg-brand-light flex items-center justify-center transition-colors">
                      <Package
                        className="w-5 h-5 text-muted group-hover:text-brand transition-colors"
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className="text-[15px] font-semibold text-charcoal">
                      {orderNumber}
                    </p>
                  </div>

                  <p className="text-[14px] text-muted">{orderDate}</p>

                  <div>
                    <StatusBadge status={order.status} />
                  </div>

                  <p className="text-[15px] font-semibold text-charcoal text-right">
                    {formatPrice(order.total)}
                  </p>

                  <div className="flex justify-end">
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ─────────────────────────────────── */
        <div className="text-center py-20 md:py-28">
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-6">
            <ShoppingBag
              className="w-9 h-9 text-muted"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="text-[20px] font-semibold text-charcoal mb-2">
            No orders yet
          </h2>
          <p className="text-[15px] text-muted max-w-sm mx-auto mb-8">
            When you place your first order, it will appear here so you can
            track its progress.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg transition-colors"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}
