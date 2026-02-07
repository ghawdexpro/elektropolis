"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Mail, Phone, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import InfiniteScroll from "@/components/shared/InfiniteScroll";
import { loadAdminCustomers, type AdminCustomer } from "@/app/admin/actions";

interface Props {
  initialCustomers: AdminCustomer[];
  totalCount: number;
}

export default function AdminCustomersTable({
  initialCustomers,
  totalCount,
}: Props) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialCustomers.length < totalCount);

  const handleLoadMore = useCallback(async () => {
    const nextPage = currentPage + 1;
    const result = await loadAdminCustomers({ page: nextPage });

    setCustomers((prev) => {
      const existingEmails = new Set(prev.map((c) => c.email));
      const newItems = result.items.filter(
        (item) => !existingEmails.has(item.email)
      );
      return [...prev, ...newItems];
    });
    setCurrentPage(nextPage);
    setHasMore(result.hasMore);
  }, [currentPage]);

  return (
    <InfiniteScroll hasMore={hasMore} loadMore={handleLoadMore}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/30">
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Customer
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Contact
              </th>
              <th className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                Orders
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                Total Spent
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Last Order
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((customer) => (
              <tr
                key={customer.email}
                className="group transition-colors hover:bg-surface/30"
              >
                <td className="px-5 py-3">
                  <div>
                    <Link
                      href={`/admin/customers/${encodeURIComponent(customer.email)}`}
                      className="font-medium text-charcoal hover:text-brand transition-colors"
                    >
                      {customer.name || customer.email}
                    </Link>
                    {customer.name && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  {customer.phone ? (
                    <div className="flex items-center gap-1.5 text-sm text-charcoal">
                      <Phone className="h-3.5 w-3.5 text-muted" />
                      {customer.phone}
                    </div>
                  ) : (
                    <span className="text-muted">{"\u2014"}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-charcoal">
                    <ShoppingBag className="h-3 w-3" />
                    {customer.orderCount}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-medium text-charcoal">
                  {formatPrice(customer.totalSpent)}
                </td>
                <td className="px-5 py-3 text-muted">
                  {customer.lastOrder
                    ? new Date(customer.lastOrder).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InfiniteScroll>
  );
}
