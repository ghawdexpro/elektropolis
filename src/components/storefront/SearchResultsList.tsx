"use client";

import { useState, useCallback } from "react";
import ProductGrid from "./ProductGrid";
import InfiniteScroll from "@/components/shared/InfiniteScroll";
import { loadSearchProducts, type FormattedProduct } from "@/app/(storefront)/actions";

interface Props {
  initialProducts: FormattedProduct[];
  totalCount: number;
  query: string;
  sort?: string;
}

export default function SearchResultsList({
  initialProducts,
  totalCount,
  query,
  sort,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount);

  const handleLoadMore = useCallback(async () => {
    const nextPage = currentPage + 1;
    const result = await loadSearchProducts({
      query,
      sort,
      page: nextPage,
    });

    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newItems = result.items.filter((item) => !existingIds.has(item.id));
      return [...prev, ...newItems];
    });
    setCurrentPage(nextPage);
    setHasMore(result.hasMore);
  }, [currentPage, query, sort]);

  return (
    <InfiniteScroll hasMore={hasMore} loadMore={handleLoadMore}>
      <ProductGrid products={products} />
    </InfiniteScroll>
  );
}
