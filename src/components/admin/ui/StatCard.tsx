import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-brand bg-brand-light",
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-white p-5",
        "transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border/60",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-charcoal">
            {value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              {trend.direction === "up" && (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              )}
              {trend.direction === "down" && (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.direction === "up" && "text-emerald-600",
                  trend.direction === "down" && "text-red-500",
                  trend.direction === "neutral" && "text-muted"
                )}
              >
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-xs text-muted">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
            iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
