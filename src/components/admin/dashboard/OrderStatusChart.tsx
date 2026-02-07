import { cn } from "@/lib/utils";

interface OrderStatusChartProps {
  data: { status: string; count: number }[];
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: "bg-amber-400",   bg: "bg-amber-400",   label: "Pending" },
  confirmed: { color: "bg-sky-400",     bg: "bg-sky-400",     label: "Confirmed" },
  shipped:   { color: "bg-indigo-400",  bg: "bg-indigo-400",  label: "Shipped" },
  delivered: { color: "bg-emerald-400", bg: "bg-emerald-400", label: "Delivered" },
  cancelled: { color: "bg-red-400",     bg: "bg-red-400",     label: "Cancelled" },
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Sort in a sensible order
  const order = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  const sorted = [...data].sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
  );

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-semibold text-charcoal">
            Order Status
          </h3>
          <span className="text-xs text-muted">
            {total} total
          </span>
        </div>
      </div>

      <div className="p-5">
        {total === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No orders yet.</p>
        ) : (
          <>
            {/* Stacked bar */}
            <div className="flex h-3 overflow-hidden rounded-full bg-surface">
              {sorted.map((d) => {
                const pct = (d.count / total) * 100;
                if (pct === 0) return null;
                const config = STATUS_CONFIG[d.status] || STATUS_CONFIG.pending;
                return (
                  <div
                    key={d.status}
                    className={cn(
                      "transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full",
                      config.bg
                    )}
                    style={{ width: `${pct}%` }}
                    title={`${config.label}: ${d.count}`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
              {sorted.map((d) => {
                const config = STATUS_CONFIG[d.status] || STATUS_CONFIG.pending;
                const pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : "0";
                return (
                  <div key={d.status} className="flex items-center gap-2">
                    <span
                      className={cn("h-2.5 w-2.5 shrink-0 rounded-full", config.color)}
                    />
                    <span className="text-xs text-charcoal">
                      {config.label}
                    </span>
                    <span className="ml-auto text-xs font-medium tabular-nums text-muted">
                      {d.count}
                    </span>
                    <span className="text-xs tabular-nums text-muted/60">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
