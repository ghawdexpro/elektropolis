"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/ui/Badge";
import InfiniteScroll from "@/components/shared/InfiniteScroll";
import { loadAdminOrders, type AdminOrder } from "@/app/admin/actions";

interface Props {
  initialOrders: AdminOrder[];
  totalCount: number;
  q?: string;
  status?: string;
  payment?: string;
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

  return (
    <InfiniteScroll hasMore={hasMore} loadMore={handleLoadMore}>
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
                Customer
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
                className="group transition-colors hover:bg-surface/30"
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
  );
}
