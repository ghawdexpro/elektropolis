import { Suspense } from "react";
import { ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import OrdersFilter from "./OrdersFilter";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";
import { RealtimeOrdersWrapper } from "@/components/admin/RealtimeOrdersWrapper";
import type { AdminOrder } from "@/app/admin/actions";

const PER_PAGE = 50;

export const metadata = { title: "Orders" };

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    payment?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_email, status, payment_status, total, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (sp.status) {
    query = query.eq("status", sp.status);
  }
  if (sp.payment) {
    query = query.eq("payment_status", sp.payment);
  }
  if (sp.q) {
    query = query.or(
      `order_number.ilike.%${sp.q}%,customer_email.ilike.%${sp.q}%`
    );
  }

  query = query.range(0, PER_PAGE - 1);

  const { data: orders, count, error } = await query;
  const totalCount = count || 0;
  const initialOrders = (orders || []) as AdminOrder[];
  const hasFilters = !!(sp.q || sp.status || sp.payment);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle={`${totalCount} order${totalCount !== 1 ? "s" : ""} total`}
      />

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <Suspense>
          <OrdersFilter />
        </Suspense>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {error ? (
          <div className="px-6 py-12 text-center text-red-600">
            Failed to load orders: {error.message}
          </div>
        ) : !orders || orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            description={
              hasFilters
                ? "Try adjusting your search or filters."
                : "Orders will appear here when customers place them."
            }
          />
        ) : (
          <RealtimeOrdersWrapper>
            <AdminOrdersTable
              key={`${sp.q}-${sp.status}-${sp.payment}`}
              initialOrders={initialOrders}
              totalCount={totalCount}
              q={sp.q}
              status={sp.status}
              payment={sp.payment}
            />
          </RealtimeOrdersWrapper>
        )}
      </div>
    </div>
  );
}
