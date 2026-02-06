import Link from "next/link";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Plus,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch stats in parallel
  const [productsRes, ordersRes, revenueRes, lowStockRes, recentOrdersRes] =
    await Promise.all([
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
        .select("id, order_number, customer_email, status, payment_status, total, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const totalProducts = productsRes.count ?? 0;
  const totalOrders = ordersRes.count ?? 0;
  const totalRevenue =
    revenueRes.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;
  const lowStockCount = lowStockRes.count ?? 0;
  const recentOrders = recentOrdersRes.data ?? [];

  const stats = [
    {
      label: "Total Products",
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: "text-brand bg-brand-light",
    },
    {
      label: "Low Stock Items",
      value: lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      color: lowStockCount > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Dashboard</h1>
          <p className="text-muted text-sm mt-1">
            Welcome back. Here is an overview of your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 border border-border hover:bg-white text-charcoal px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Store
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-border p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{stat.label}</p>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-charcoal mt-2">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-charcoal">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-brand hover:text-brand-hover font-medium"
          >
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 font-medium text-muted">Order</th>
                  <th className="px-6 py-3 font-medium text-muted">Date</th>
                  <th className="px-6 py-3 font-medium text-muted">
                    Customer
                  </th>
                  <th className="px-6 py-3 font-medium text-muted">Status</th>
                  <th className="px-6 py-3 font-medium text-muted">
                    Payment
                  </th>
                  <th className="px-6 py-3 font-medium text-muted text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface/50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-charcoal hover:text-brand"
                      >
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 text-charcoal">
                      {order.customer_email}
                    </td>
                    <td className="px-6 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-3">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-charcoal">
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
