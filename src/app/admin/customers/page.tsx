import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import AdminCustomersTable from "@/components/admin/AdminCustomersTable";
import type { AdminCustomer } from "@/app/admin/actions";

const PER_PAGE = 50;

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "customer_email, shipping_address, customer_phone, total, created_at"
    )
    .order("created_at", { ascending: false });

  const customerMap = new Map<string, AdminCustomer>();

  for (const order of orders || []) {
    const email = order.customer_email;
    const addr = order.shipping_address as Record<string, string> | null;
    const existing = customerMap.get(email);

    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += order.total || 0;
      if (!existing.name && addr?.name) {
        existing.name = addr.name;
      }
      if (!existing.phone && order.customer_phone) {
        existing.phone = order.customer_phone;
      }
    } else {
      customerMap.set(email, {
        email,
        name: addr?.name || null,
        phone: order.customer_phone || null,
        orderCount: 1,
        totalSpent: order.total || 0,
        lastOrder: order.created_at,
      });
    }
  }

  const allCustomers = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  const totalCount = allCustomers.length;
  const initialCustomers = allCustomers.slice(0, PER_PAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle={`${totalCount} customer${totalCount !== 1 ? "s" : ""} from order history`}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {allCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Customer data will appear here as orders are placed."
          />
        ) : (
          <AdminCustomersTable
            initialCustomers={initialCustomers}
            totalCount={totalCount}
          />
        )}
      </div>
    </div>
  );
}
