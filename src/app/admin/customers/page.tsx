import { Users, Mail, Phone, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Customers" };

interface Customer {
  email: string;
  name: string | null;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrder: string | null;
}

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  // Get all unique customers from orders
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "customer_email, shipping_address, customer_phone, total, created_at"
    )
    .order("created_at", { ascending: false });

  // Aggregate by email
  const customerMap = new Map<string, Customer>();

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

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Customers</h1>
        <p className="text-muted text-sm mt-1">
          {customers.length} customers from order history.
        </p>
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {customers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">No customers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left bg-surface/50">
                  <th className="px-6 py-3 font-medium text-muted">
                    Customer
                  </th>
                  <th className="px-6 py-3 font-medium text-muted">Contact</th>
                  <th className="px-6 py-3 font-medium text-muted text-center">
                    Orders
                  </th>
                  <th className="px-6 py-3 font-medium text-muted text-right">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 font-medium text-muted">
                    Last Order
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((customer) => (
                  <tr key={customer.email} className="hover:bg-surface/30">
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium text-charcoal">
                          {customer.name || "—"}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {customer.phone ? (
                        <div className="flex items-center gap-1.5 text-sm text-charcoal">
                          <Phone className="w-3.5 h-3.5 text-muted" />
                          {customer.phone}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-surface rounded-full text-xs font-medium text-charcoal">
                        <ShoppingBag className="w-3 h-3" />
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-charcoal">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-3 text-muted">
                      {customer.lastOrder
                        ? new Date(customer.lastOrder).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
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
