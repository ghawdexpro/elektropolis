import { cn } from "@/lib/utils";

export interface ActivityItem {
  type: "order" | "payment" | "status" | "stock" | "subscriber";
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

const TYPE_COLORS: Record<ActivityItem["type"], string> = {
  order: "bg-brand",
  payment: "bg-emerald-500",
  status: "bg-sky-500",
  stock: "bg-amber-500",
  subscriber: "bg-violet-500",
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const visibleItems = items.slice(0, 8);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-base font-semibold text-charcoal">
          Recent Activity
        </h3>
      </div>

      <div className="p-5">
        {visibleItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No recent activity.
          </p>
        ) : (
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
              {visibleItems.map((item, i) => (
                <div key={i} className="relative flex items-start gap-3 pl-0">
                  {/* Dot */}
                  <div className="relative z-10 mt-1.5 flex shrink-0">
                    <span
                      className={cn(
                        "h-[11px] w-[11px] rounded-full ring-2 ring-card",
                        TYPE_COLORS[item.type]
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pb-0.5">
                    <p className="text-sm leading-snug text-charcoal">
                      {item.description}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
