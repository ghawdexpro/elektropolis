"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface BulkAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "danger";
  loading?: boolean;
}

interface BulkActionBarProps {
  count: number;
  actions: BulkAction[];
  onClear: () => void;
}

export function BulkActionBar({ count, actions, onClear }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-xl shadow-black/10">
        <div className="flex items-center gap-2">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-brand px-1.5 text-xs font-bold text-white">
            {count}
          </span>
          <span className="text-sm font-medium text-charcoal">selected</span>
        </div>

        <div className="h-5 w-px bg-border" />

        <div className="flex items-center gap-1.5">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={action.onClick}
                disabled={action.loading}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                  action.variant === "danger"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-charcoal hover:bg-surface"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {action.label}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-border" />

        <button
          onClick={onClear}
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-charcoal transition-colors"
          aria-label="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
