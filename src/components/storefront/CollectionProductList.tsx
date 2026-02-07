"use client";

import { useState, useCallback } from "react";
import ProductGrid from "./ProductGrid";
import InfiniteScroll from "@/components/shared/InfiniteScroll";
import { loadCollectionProducts, type FormattedProduct } from "@/app/(storefront)/actions";

interface Props {
  initialProducts: FormattedProduct[];
  totalCount: number;
  collectionId: string;
  collectionHandle?: string;
  filters: Record<string, string | undefined>;
}

export default function CollectionProductList({
  initialProducts,
  totalCount,
  collectionId,
  collectionHandle,
  filters,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount);

  const handleLoadMore = useCallback(async () => {
    const nextPage = currentPage + 1;
    const result = await loadCollectionProducts({
      collectionId,
      collectionHandle,
      page: nextPage,
      ...filters,
    });

    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newItems = result.items.filter((item) => !existingIds.has(item.id));
      return [...prev, ...newItems];
    });
    setCurrentPage(nextPage);
    setHasMore(result.hasMore);
  }, [currentPage, collectionId, collectionHandle, filters]);

  return (
    <InfiniteScroll hasMore={hasMore} loadMore={handleLoadMore}>
      <ProductGrid products={products} />
    </InfiniteScroll>
  );
}
