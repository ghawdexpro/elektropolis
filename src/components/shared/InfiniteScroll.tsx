"use client";

import { useRef, useEffect, useCallback, useTransition } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  hasMore: boolean;
  loadMore: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export default function InfiniteScroll({
  hasMore,
  loadMore,
  children,
  className,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const loadingRef = useRef(false);

  const handleLoadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    startTransition(async () => {
      try {
        await loadMore();
      } finally {
        loadingRef.current = false;
      }
    });
  }, [hasMore, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, handleLoadMore]);

  return (
    <div className={className}>
      {children}
      <div ref={sentinelRef} className="w-full" />
      {isPending && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        </div>
      )}
    </div>
  );
}
