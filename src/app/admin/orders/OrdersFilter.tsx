"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

export default function OrdersFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");

  const currentStatus = searchParams.get("status") || "";
  const currentPayment = searchParams.get("payment") || "";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: search || null });
  }

  const selectClass =
    "rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order # or email..."
          className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-8 text-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              updateParams({ q: null });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-3.5 w-3.5 text-muted hover:text-charcoal transition-colors" />
          </button>
        )}
      </form>

      {/* Status filter */}
      <select
        value={currentStatus}
        onChange={(e) => updateParams({ status: e.target.value || null })}
        className={selectClass}
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {/* Payment filter */}
      <select
        value={currentPayment}
        onChange={(e) => updateParams({ payment: e.target.value || null })}
        className={selectClass}
      >
        <option value="">All payments</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
      </select>
    </div>
  );
}
