import Link from "next/link";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Plus,
  ExternalLink,
  CreditCard,
  Mail,
  ArrowUpRight,
  TrendingUp,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatCard } from "@/components/admin/ui/StatCard";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  Badge,
} from "@/components/admin/ui/Badge";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    productsRes,
    ordersRes,
    revenueRes,
    lowStockRes,
    unpaidRes,
    subscribersRes,
    recentOrdersRes,
    lowStockProductsRes,
    topProductsRes,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("total")
      .in("payment_status", ["paid", "completed"]),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .lte("inventory_count", 5)
      .gt("inventory_count", -1),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "pending"),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("orders")
      .select(
        "id, order_number, customer_email, status, payment_status, total, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("products")
      .select("id, title, handle, inventory_count, vendor")
      .lte("inventory_count", 5)
      .gt("inventory_count", -1)
      .eq("status", "active")
      .order("inventory_count", { ascending: true })
      .limit(5),
    supabase
      .from("order_items")
      .select("title, quantity, price, product_id")
      .order("quantity", { ascending: false })
      .limit(20),
  ]);

  const totalProducts = productsRes.count ?? 0;
  const totalOrders = ordersRes.count ?? 0;
  const totalRevenue =
    revenueRes.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;
  const lowStockCount = lowStockRes.count ?? 0;
  const unpaidCount = unpaidRes.count ?? 0;
  const subscriberCount = subscribersRes.count ?? 0;
  const recentOrders = recentOrdersRes.data ?? [];
  const lowStockProducts = lowStockProductsRes.data ?? [];

  // Aggregate top products from order items
  const productSales = new Map<
    string,
    { title: string; totalQty: number; totalRev: number }
  >();
  for (const item of topProductsRes.data ?? []) {
    const key = item.product_id ?? item.title;
    const existing = productSales.get(key);
    if (existing) {
      existing.totalQty += item.quantity;
      existing.totalRev += item.price * item.quantity;
    } else {
      productSales.set(key, {
        title: item.title,
        totalQty: item.quantity,
        totalRev: item.price * item.quantity,
      });
    }
  }
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.totalRev - a.totalRev)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your store performance"
        actions={
          <>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Store
            </Link>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Products"
          value={totalProducts.toLocaleString()}
          icon={Package}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="Orders"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="Revenue"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
          iconColor="text-brand bg-brand-light"
        />
        <StatCard
          label="Low Stock"
          value={lowStockCount.toLocaleString()}
          icon={AlertTriangle}
          iconColor={
            lowStockCount > 0
              ? "text-red-600 bg-red-50"
              : "text-emerald-600 bg-emerald-50"
          }
        />
        <StatCard
          label="Unpaid"
          value={unpaidCount.toLocaleString()}
          icon={CreditCard}
          iconColor={
            unpaidCount > 0
              ? "text-amber-600 bg-amber-50"
              : "text-emerald-600 bg-emerald-50"
          }
        />
        <StatCard
          label="Subscribers"
          value={subscriberCount.toLocaleString()}
          icon={Mail}
          iconColor="text-violet-600 bg-violet-50"
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders — spans 2 columns */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-charcoal">
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-hover transition-colors"
              >
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="px-6 py-16 text-center text-muted text-sm">
                No orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface/30">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                        Order
                      </th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                        Customer
                      </th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                        Status
                      </th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                        Payment
                      </th>
                      <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="group hover:bg-surface/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-charcoal hover:text-brand transition-colors"
                          >
                            #{order.order_number}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-charcoal">
                          <span className="max-w-[160px] truncate block">
                            {order.customer_email}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-3">
                          <PaymentStatusBadge status={order.payment_status} />
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-charcoal">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Top Products */}
          <div className="rounded-xl border border-border bg-white">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-base font-semibold text-charcoal flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                Top Products
              </h3>
            </div>
            {topProducts.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted">
                No sales data yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {topProducts.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-charcoal">
                        {product.title}
                      </p>
                      <p className="text-xs text-muted">
                        {product.totalQty} sold
                      </p>
                    </div>
                    <span className="ml-3 shrink-0 text-sm font-semibold text-charcoal">
                      {formatPrice(product.totalRev)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="rounded-xl border border-border bg-white">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-base font-semibold text-charcoal flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Low Stock Alerts
              </h3>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted">
                All products are well stocked.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-charcoal">
                        {product.title}
                      </p>
                      <p className="text-xs text-muted">{product.vendor}</p>
                    </div>
                    <Badge
                      variant={product.inventory_count <= 0 ? "error" : "warning"}
                      label={
                        product.inventory_count <= 0
                          ? "Out of stock"
                          : `${product.inventory_count} left`
                      }
                      dot={false}
                      size="sm"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
