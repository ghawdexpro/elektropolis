"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  size = "md",
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2.5",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2",
          size === "sm" && "h-5 w-9",
          size === "md" && "h-6 w-11",
          checked ? "bg-brand" : "bg-border"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
            size === "sm" && "h-4 w-4 translate-y-0.5",
            size === "md" && "h-5 w-5 translate-y-0.5",
            checked
              ? size === "sm"
                ? "translate-x-[18px]"
                : "translate-x-[22px]"
              : "translate-x-0.5"
          )}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-charcoal">{label}</span>
      )}
    </label>
  );
}
