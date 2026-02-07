import { cn } from "@/lib/utils";

/* ─── Base Skeleton ─── */

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn("animate-shimmer rounded-md", className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/* ─── Text Skeleton ─── */

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

const LINE_WIDTHS = ["100%", "92%", "78%", "85%", "65%"];

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          width={LINE_WIDTHS[i % LINE_WIDTHS.length]}
        />
      ))}
    </div>
  );
}

/* ─── StatCard Skeleton ─── */

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      </div>
    </div>
  );
}

/* ─── Table Skeleton ─── */

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const CELL_WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-16"];

export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center gap-6 border-b border-border bg-surface/50 px-5 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", CELL_WIDTHS[i % CELL_WIDTHS.length])}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center gap-6 px-5 py-3.5"
            style={{ animationDelay: `${rowIndex * 50}ms` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  "h-3.5",
                  CELL_WIDTHS[(colIndex + rowIndex) % CELL_WIDTHS.length]
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Chart Skeleton ─── */

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-card", className)}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <Skeleton className="h-5 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-12 rounded-md" />
          <Skeleton className="h-7 w-12 rounded-md" />
          <Skeleton className="h-7 w-12 rounded-md" />
        </div>
      </div>

      {/* Chart area */}
      <div className="relative px-6 py-8">
        {/* Faux chart bars */}
        <div className="flex items-end justify-between gap-1.5 h-48">
          {Array.from({ length: 14 }).map((_, i) => {
            const heights = [60, 45, 75, 50, 85, 40, 65, 70, 55, 90, 48, 72, 58, 80];
            return (
              <div
                key={i}
                className="flex-1 animate-shimmer rounded-t-sm"
                style={{ height: `${heights[i % heights.length]}%` }}
              />
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="mt-3 flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Card Skeleton ─── */

interface SkeletonCardProps {
  hasImage?: boolean;
  lines?: number;
  className?: string;
}

export function SkeletonCard({
  hasImage = false,
  lines = 2,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
      aria-hidden="true"
    >
      {hasImage && <Skeleton className="h-40 w-full rounded-none" />}
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3"
            width={i === lines - 1 ? "55%" : "90%"}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard Skeleton ─── */

export function SkeletonDashboard() {
  return (
    <div className="space-y-8" aria-hidden="true">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 animate-stagger">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3 animate-stagger">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        <SkeletonCard lines={5} />
      </div>

      {/* Content row */}
      <div className="grid gap-6 lg:grid-cols-3 animate-stagger">
        <div className="lg:col-span-2">
          <SkeletonTable rows={6} columns={5} />
        </div>
        <SkeletonCard lines={8} />
      </div>
    </div>
  );
}

/* ─── Detail Page Skeleton ─── */

export function SkeletonDetailPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-hidden="true">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-4" />
        <Skeleton className="h-3.5 w-24" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 animate-stagger">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border bg-card p-5"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table */}
      <SkeletonTable rows={4} columns={6} />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-stagger">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}

/* ─── Form Page Skeleton ─── */

export function SkeletonFormPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" aria-hidden="true">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6 animate-stagger">
        <Skeleton className="h-5 w-36" />
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Second card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── List Page Skeleton ─── */

export function SkeletonListPage() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-10 flex-1 max-w-sm rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Table */}
      <SkeletonTable rows={8} columns={5} />
    </div>
  );
}
