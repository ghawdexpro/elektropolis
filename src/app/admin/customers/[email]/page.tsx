"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Phone, ShoppingBag, DollarSign } from "lucide-react";
import { SkeletonStatCard, SkeletonTable } from "@/components/admin/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatCard } from "@/components/admin/ui/StatCard";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/ui/Badge";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  shipping_address: Record<string, string> | null;
}

export default function CustomerDetailPage() {
  const params = useParams<{ email: string }>();
  const email = decodeURIComponent(params.email);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = createClient();
    s.from("orders")
      .select(
        "id, order_number, status, payment_status, total, created_at, shipping_address, customer_phone"
      )
      .eq("customer_email", email)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setLoading(false);
      });
  }, [email]);

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const customerName =
    (orders[0]?.shipping_address as Record<string, string> | null)?.name ?? null;
  const customerPhone =
    (orders[0] as unknown as Record<string, string | null>)?.customer_phone ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={customerName || email}
        subtitle={customerName ? email : undefined}
        breadcrumbs={[
          { label: "Customers", href: "/admin/customers" },
          { label: customerName || email },
        ]}
      />

      {loading ? (
        <div className="space-y-6 animate-stagger">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
          <SkeletonTable rows={5} columns={5} />
        </div>
      ) : (
        <>
          {/* Customer info cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Orders"
              value={orders.length.toString()}
              icon={ShoppingBag}
              iconColor="text-blue-600 bg-blue-50"
            />
            <StatCard
              label="Total Spent"
              value={formatPrice(totalSpent)}
              icon={DollarSign}
              iconColor="text-brand bg-brand-light"
            />
            <div className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <p className="mt-1 truncate text-sm font-medium text-charcoal">
                {email}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <p className="mt-1 text-sm font-medium text-charcoal">
                {customerPhone || "—"}
              </p>
            </div>
          </div>

          {/* Order history */}
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-charcoal">
                Order History
              </h2>
            </div>
            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted">
                No orders found for this customer.
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
                        Date
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
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-surface/30"
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-charcoal hover:text-brand transition-colors"
                          >
                            #{order.order_number}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-muted">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
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
        </>
      )}
    </div>
  );
}
