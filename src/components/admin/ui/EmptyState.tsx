import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  const actionButton = action && (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover transition-colors">
      {ActionIcon && <ActionIcon className="h-4 w-4" />}
      {action.label}
    </span>
  );

  return (
    <div className={cn("px-6 py-16 text-center", className)}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
        <Icon className="h-6 w-6 text-muted" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
      {description && (
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Link href={action.href}>{actionButton}</Link>
          ) : (
            <button onClick={action.onClick}>{actionButton}</button>
          )}
        </div>
      )}
    </div>
  );
}
