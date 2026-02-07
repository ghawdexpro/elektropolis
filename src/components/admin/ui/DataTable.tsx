import Link from "next/link";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { SkeletonTable } from "./Skeleton";
import type { LucideIcon } from "lucide-react";

type Alignment = "left" | "center" | "right";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  align?: Alignment;
  width?: string;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  rowKey: (row: T, index: number) => string;
  rowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
      label: string;
      href?: string;
      onClick?: () => void;
      icon?: LucideIcon;
    };
  };
  className?: string;
}

const alignClass: Record<Alignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTable<T>({
  columns,
  data,
  loading,
  rowKey,
  rowHref,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <SkeletonTable
        rows={6}
        columns={columns.length}
        className={className}
      />
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className={cn("rounded-xl border border-border bg-card", className)}>
        <EmptyState {...emptyState} />
      </div>
    );
  }

  const isClickable = !!rowHref || !!onRowClick;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted",
                    alignClass[col.align ?? "left"],
                    col.width && `w-[${col.width}]`,
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIndex) => {
              const key = rowKey(row, rowIndex);
              const href = rowHref?.(row);

              const cells = columns.map((col, colIndex) => {
                const content = col.render
                  ? col.render(row, rowIndex)
                  : col.accessor
                    ? String((row as Record<string, unknown>)[col.accessor as string] ?? "")
                    : null;

                return (
                  <td
                    key={colIndex}
                    className={cn(
                      "px-5 py-3",
                      alignClass[col.align ?? "left"],
                      col.className
                    )}
                  >
                    {content}
                  </td>
                );
              });

              if (href) {
                return (
                  <tr key={key} className="group relative hover:bg-surface/40 transition-colors">
                    {cells}
                    <td className="absolute inset-0">
                      <Link href={href} className="absolute inset-0" aria-label="View details" />
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={key}
                  className={cn(
                    "transition-colors",
                    isClickable
                      ? "cursor-pointer hover:bg-surface/40"
                      : "hover:bg-surface/20"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {cells}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
