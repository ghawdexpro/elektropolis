"use client";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg border border-border bg-surface/50 p-0.5",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
            activeTab === tab.id
              ? "bg-white text-charcoal shadow-sm"
              : "text-muted hover:text-charcoal"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "tabular-nums rounded-full px-1.5 py-px text-[10px] font-semibold",
                activeTab === tab.id
                  ? "bg-brand/10 text-brand"
                  : "bg-surface text-muted"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
