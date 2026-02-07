"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductStatusBadge, Badge } from "@/components/admin/ui/Badge";
import InfiniteScroll from "@/components/shared/InfiniteScroll";
import { loadAdminProducts, type AdminProduct } from "@/app/admin/actions";

interface Props {
  initialProducts: AdminProduct[];
  totalCount: number;
  q?: string;
  status?: string;
}

export default function AdminProductsTable({
  initialProducts,
  totalCount,
  q,
  status,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount);

  const handleLoadMore = useCallback(async () => {
    const nextPage = currentPage + 1;
    const result = await loadAdminProducts({ page: nextPage, q, status });

    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newItems = result.items.filter((item) => !existingIds.has(item.id));
      return [...prev, ...newItems];
    });
    setCurrentPage(nextPage);
    setHasMore(result.hasMore);
  }, [currentPage, q, status]);

  return (
    <InfiniteScroll hasMore={hasMore} loadMore={handleLoadMore}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/30">
              <th className="w-16 px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted" />
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Product
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Vendor
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                Price
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                Stock
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr
                key={product.id}
                className="group transition-colors hover:bg-surface/30"
              >
                <td className="px-5 py-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
                    {product.primaryImage ? (
                      <Image
                        src={product.primaryImage.url}
                        alt={product.primaryImage.alt_text ?? product.title}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-muted" />
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-charcoal hover:text-brand transition-colors"
                  >
                    {product.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted">
                  {product.vendor ?? "—"}
                </td>
                <td className="px-5 py-3 text-right font-medium text-charcoal">
                  {formatPrice(product.price)}
                </td>
                <td className="px-5 py-3 text-right">
                  <StockIndicator count={product.inventory_count} />
                </td>
                <td className="px-5 py-3">
                  <ProductStatusBadge status={product.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InfiniteScroll>
  );
}

function StockIndicator({ count }: { count: number }) {
  if (count <= 0) {
    return <Badge variant="error" label="Out of stock" dot={false} size="sm" />;
  }
  if (count <= 5) {
    return <Badge variant="warning" label={`${count} left`} dot={false} size="sm" />;
  }
  return <span className="text-sm text-muted">{count}</span>;
}
