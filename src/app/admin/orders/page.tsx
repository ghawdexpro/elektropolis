import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_email, status, payment_status, total, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Orders</h1>
        <p className="text-muted text-sm mt-1">
          View and manage customer orders.
        </p>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {error ? (
          <div className="px-6 py-12 text-center text-red-600">
            Failed to load orders: {error.message}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left bg-surface/50">
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface/30">
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
