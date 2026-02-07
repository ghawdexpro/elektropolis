"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Trash2, Download } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/ui/Badge";
import { BulkActionBar } from "@/components/admin/ui/BulkActionBar";
import InfiniteScroll from "@/components/shared/InfiniteScroll";
import { loadAdminOrders, type AdminOrder } from "@/app/admin/actions";

interface Props {
  initialOrders: AdminOrder[];
  totalCount: number;
  q?: string;
  status?: string;
  payment?: string;
}

type SortKey = "order_number" | "created_at" | "customer_email" | "total" | "status" | "payment_status";
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
  align?: "left" | "right";
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      className={cn(
        "px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted cursor-pointer select-none hover:text-charcoal transition-colors",
        align === "right" ? "text-right" : "text-left"
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
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

export default function AdminOrdersTable({
  initialOrders,
  totalCount,
  q,
  status,
  payment,
}: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialOrders.length < totalCount);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleLoadMore = useCallback(async () => {
    const nextPage = currentPage + 1;
    const result = await loadAdminOrders({
      page: nextPage,
      q,
      status,
      payment,
    });

    setOrders((prev) => {
      const existingIds = new Set(prev.map((o) => o.id));
      const newItems = result.items.filter(
        (item) => !existingIds.has(item.id)
      );
      return [...prev, ...newItems];
    });
    setCurrentPage(nextPage);
    setHasMore(result.hasMore);
  }, [currentPage, q, status, payment]);

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
    if (!sortKey) return orders;
    return [...orders].sort((a, b) => {
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
  }, [orders, sortKey, sortDir]);

  const allSelected = sorted.length > 0 && selectedIds.size === sorted.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((o) => o.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExportSelected = () => {
    const selected = orders.filter((o) => selectedIds.has(o.id));
    const headers = ["Order", "Date", "Customer", "Status", "Payment", "Total"];
    const rows = selected.map((o) => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString("en-GB"),
      o.customer_email,
      o.status,
      o.payment_status,
      o.total.toString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <InfiniteScroll hasMore={hasMore} loadMore={handleLoadMore}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/30">
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30 cursor-pointer"
                  />
                </th>
                <SortHeader label="Order" sortKey="order_number" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Date" sortKey="created_at" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Customer" sortKey="customer_email" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Status" sortKey="status" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Payment" sortKey="payment_status" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Total" sortKey="total" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((order) => (
                <tr
                  key={order.id}
                  className={cn(
                    "group transition-colors hover:bg-surface/30",
                    selectedIds.has(order.id) && "bg-brand/[0.04]"
                  )}
                >
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleOne(order.id)}
                      className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30 cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-charcoal hover:text-brand transition-colors"
                    >
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <span className="block max-w-[180px] truncate text-charcoal">
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
      </InfiniteScroll>

      <BulkActionBar
        count={selectedIds.size}
        actions={[
          {
            label: "Export CSV",
            icon: Download,
            onClick: handleExportSelected,
          },
        ]}
        onClear={() => setSelectedIds(new Set())}
      />
    </>
  );
}
