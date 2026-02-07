"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ArrowUp, ArrowDown, Download } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { ProductStatusBadge, Badge } from "@/components/admin/ui/Badge";
import { BulkActionBar } from "@/components/admin/ui/BulkActionBar";
import InfiniteScroll from "@/components/shared/InfiniteScroll";
import { loadAdminProducts, type AdminProduct } from "@/app/admin/actions";
import { downloadCSV } from "@/lib/csv-export";

interface Props {
  initialProducts: AdminProduct[];
  totalCount: number;
  q?: string;
  status?: string;
}

type SortKey = "title" | "vendor" | "price" | "inventory_count" | "status";
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

export default function AdminProductsTable({
  initialProducts,
  totalCount,
  q,
  status,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    if (!sortKey) return products;
    return [...products].sort((a, b) => {
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
  }, [products, sortKey, sortDir]);

  const allSelected = sorted.length > 0 && selectedIds.size === sorted.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((p) => p.id)));
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
    const selected = products.filter((p) => selectedIds.has(p.id));
    downloadCSV(
      `products-export-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Title", "Vendor", "Price", "Stock", "Status"],
      selected.map((p) => [
        p.title,
        p.vendor ?? "",
        p.price.toString(),
        p.inventory_count.toString(),
        p.status,
      ])
    );
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
                <th className="w-16 px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted" />
                <SortHeader label="Product" sortKey="title" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Vendor" sortKey="vendor" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Price" sortKey="price" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Stock" sortKey="inventory_count" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Status" sortKey="status" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((product) => (
                <tr
                  key={product.id}
                  className={cn(
                    "group transition-colors hover:bg-surface/30",
                    selectedIds.has(product.id) && "bg-brand/[0.04]"
                  )}
                >
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleOne(product.id)}
                      className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30 cursor-pointer"
                    />
                  </td>
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

function StockIndicator({ count }: { count: number }) {
  if (count <= 0) {
    return <Badge variant="error" label="Out of stock" dot={false} size="sm" />;
  }
  if (count <= 5) {
    return <Badge variant="warning" label={`${count} left`} dot={false} size="sm" />;
  }
  return <span className="text-sm text-muted">{count}</span>;
}
