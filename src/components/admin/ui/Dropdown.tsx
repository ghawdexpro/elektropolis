"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownDivider {
  divider: true;
}

type DropdownEntry = DropdownItem | DropdownDivider;

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownEntry[];
  align?: "left" | "right";
  className?: string;
}

function isDivider(entry: DropdownEntry): entry is DropdownDivider {
  return "divider" in entry;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard navigation
  const actionItems = items
    .map((item, i) => ({ item, index: i }))
    .filter(({ item }) => !isDivider(item) && !(item as DropdownItem).disabled);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setOpen(true);
      setFocusIndex(0);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => {
        const currentPos = actionItems.findIndex((a) => a.index === i);
        const next = Math.min(currentPos + 1, actionItems.length - 1);
        return actionItems[next].index;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => {
        const currentPos = actionItems.findIndex((a) => a.index === i);
        const prev = Math.max(currentPos - 1, 0);
        return actionItems[prev].index;
      });
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = items[focusIndex];
      if (item && !isDivider(item) && !item.disabled) {
        item.onClick();
        setOpen(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex", className)}
      onKeyDown={handleKeyDown}
    >
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>

      {open && (
        <div
          ref={menuRef}
          className={cn(
            "absolute top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg shadow-black/[0.08]",
            "animate-[slideUp_100ms_cubic-bezier(0.16,1,0.3,1)]",
            align === "right" ? "right-0" : "left-0"
          )}
          role="menu"
        >
          {items.map((entry, i) => {
            if (isDivider(entry)) {
              return (
                <div
                  key={`divider-${i}`}
                  className="my-1 border-t border-border"
                />
              );
            }

            const Icon = entry.icon;
            const isFocused = focusIndex === i;

            return (
              <button
                key={i}
                role="menuitem"
                disabled={entry.disabled}
                onClick={() => {
                  entry.onClick();
                  setOpen(false);
                }}
                onMouseEnter={() => setFocusIndex(i)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-75",
                  entry.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-charcoal hover:bg-surface/60",
                  isFocused && (entry.danger ? "bg-red-50" : "bg-surface/60"),
                  entry.disabled && "cursor-not-allowed opacity-40"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      entry.danger ? "text-red-500" : "text-muted"
                    )}
                  />
                )}
                <span className="font-medium">{entry.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
