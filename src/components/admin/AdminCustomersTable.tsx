"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Mail, Phone, ShoppingBag, ArrowUp, ArrowDown, Crown, Star, UserPlus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import InfiniteScroll from "@/components/shared/InfiniteScroll";
import { loadAdminCustomers, type AdminCustomer } from "@/app/admin/actions";

interface Props {
  initialCustomers: AdminCustomer[];
  totalCount: number;
}

type SortKey = "email" | "orderCount" | "totalSpent" | "lastOrder";
type SortDir = "asc" | "desc";

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey | null;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "right" | "center";
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      className={cn(
        "px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted cursor-pointer select-none hover:text-charcoal transition-colors",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className={cn(
        "inline-flex items-center gap-1",
        align === "right" && "justify-end",
        align === "center" && "justify-center"
      )}>
        {label}
        {isActive && (
          currentDir === "asc"
            ? <ArrowUp className="h-3 w-3 text-brand" />
            : <ArrowDown className="h-3 w-3 text-brand" />
        )}
      </span>
    </th>
  );
}

export default function AdminCustomersTable({
  initialCustomers,
  totalCount,
}: Props) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialCustomers.length < totalCount);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const sorted = useMemo(() => {
    if (!sortKey) return customers;
    return [...customers].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      let cmp: number;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [customers, sortKey, sortDir]);

  return (
    <InfiniteScroll hasMore={hasMore} loadMore={handleLoadMore}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/30">
              <SortHeader label="Customer" sortKey="email" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Contact
              </th>
              <SortHeader label="Orders" sortKey="orderCount" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="center" />
              <SortHeader label="Total Spent" sortKey="totalSpent" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
              <SortHeader label="Last Order" sortKey="lastOrder" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((customer) => (
              <tr
                key={customer.email}
                className="group transition-colors hover:bg-surface/30"
              >
                <td className="px-5 py-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/customers/${encodeURIComponent(customer.email)}`}
                        className="font-medium text-charcoal hover:text-brand transition-colors"
                      >
                        {customer.name || customer.email}
                      </Link>
                      <LtvTier totalSpent={customer.totalSpent} orderCount={customer.orderCount} />
                    </div>
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

function LtvTier({ totalSpent, orderCount }: { totalSpent: number; orderCount: number }) {
  if (totalSpent >= 500 || orderCount >= 5) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700" title="VIP Customer">
        <Crown className="h-2.5 w-2.5" />
        VIP
      </span>
    );
  }
  if (totalSpent >= 100 || orderCount >= 2) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted" title="Regular Customer">
        <Star className="h-2.5 w-2.5" />
        Regular
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-600" title="New Customer">
      <UserPlus className="h-2.5 w-2.5" />
      New
    </span>
  );
}
