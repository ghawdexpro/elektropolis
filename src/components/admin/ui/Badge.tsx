import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type BadgeVariant =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "paid"
  | "failed"
  | "refunded"
  | "active"
  | "draft"
  | "archived"
  | "visible"
  | "hidden"
  | "info"
  | "warning"
  | "success"
  | "error"
  | "neutral";

const variantStyles: Record<BadgeVariant, string> = {
  // Order statuses
  pending:
    "bg-amber-50 text-amber-700 border-amber-200/80 [--badge-dot:theme(--color-amber-500)]",
  confirmed:
    "bg-sky-50 text-sky-700 border-sky-200/80 [--badge-dot:theme(--color-sky-500)]",
  shipped:
    "bg-violet-50 text-violet-700 border-violet-200/80 [--badge-dot:theme(--color-violet-500)]",
  delivered:
    "bg-emerald-50 text-emerald-700 border-emerald-200/80 [--badge-dot:theme(--color-emerald-500)]",
  cancelled:
    "bg-red-50 text-red-700 border-red-200/80 [--badge-dot:theme(--color-red-500)]",

  // Payment statuses
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200/80 [--badge-dot:theme(--color-emerald-500)]",
  failed:
    "bg-red-50 text-red-700 border-red-200/80 [--badge-dot:theme(--color-red-500)]",
  refunded:
    "bg-slate-50 text-slate-600 border-slate-200/80 [--badge-dot:theme(--color-slate-400)]",

  // Product statuses
  active:
    "bg-emerald-50 text-emerald-700 border-emerald-200/80 [--badge-dot:theme(--color-emerald-500)]",
  draft:
    "bg-amber-50 text-amber-700 border-amber-200/80 [--badge-dot:theme(--color-amber-500)]",
  archived:
    "bg-slate-50 text-slate-500 border-slate-200/80 [--badge-dot:theme(--color-slate-400)]",

  // Visibility
  visible:
    "bg-emerald-50 text-emerald-700 border-emerald-200/80 [--badge-dot:theme(--color-emerald-500)]",
  hidden:
    "bg-slate-50 text-slate-500 border-slate-200/80 [--badge-dot:theme(--color-slate-400)]",

  // Generic
  info: "bg-sky-50 text-sky-700 border-sky-200/80 [--badge-dot:theme(--color-sky-500)]",
  warning:
    "bg-amber-50 text-amber-700 border-amber-200/80 [--badge-dot:theme(--color-amber-500)]",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200/80 [--badge-dot:theme(--color-emerald-500)]",
  error:
    "bg-red-50 text-red-700 border-red-200/80 [--badge-dot:theme(--color-red-500)]",
  neutral:
    "bg-slate-50 text-slate-600 border-slate-200/80 [--badge-dot:theme(--color-slate-400)]",
};

const variantLabels: Partial<Record<BadgeVariant, string>> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  active: "Active",
  draft: "Draft",
  archived: "Archived",
  visible: "Visible",
  hidden: "Hidden",
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  icon?: LucideIcon;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  variant,
  label,
  icon: Icon,
  dot = true,
  size = "sm",
  className,
}: BadgeProps) {
  const displayLabel = label ?? variantLabels[variant] ?? variant;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        variantStyles[variant],
        className
      )}
    >
      {dot && !Icon && (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--badge-dot)]" />
      )}
      {Icon && <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />}
      {displayLabel}
    </span>
  );
}

/* Convenience wrappers for common use cases */
export function OrderStatusBadge({ status }: { status: string }) {
  const variant = (
    Object.keys(variantStyles).includes(status) ? status : "neutral"
  ) as BadgeVariant;
  return <Badge variant={variant} />;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    pending: "pending",
    paid: "paid",
    completed: "paid",
    failed: "failed",
    refunded: "refunded",
  };
  return <Badge variant={map[status] ?? "neutral"} label={status.charAt(0).toUpperCase() + status.slice(1)} />;
}

export function ProductStatusBadge({ status }: { status: string }) {
  const variant = (
    ["active", "draft", "archived"].includes(status) ? status : "neutral"
  ) as BadgeVariant;
  return <Badge variant={variant} />;
}
