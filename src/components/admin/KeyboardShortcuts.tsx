"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const SHORTCUTS: {
  keys: string[];
  label: string;
  description: string;
  action: string;
}[] = [
  { keys: ["G", "D"], label: "G → D", description: "Go to Dashboard", action: "/admin" },
  { keys: ["G", "P"], label: "G → P", description: "Go to Products", action: "/admin/products" },
  { keys: ["G", "O"], label: "G → O", description: "Go to Orders", action: "/admin/orders" },
  { keys: ["G", "C"], label: "G → C", description: "Go to Collections", action: "/admin/collections" },
  { keys: ["G", "U"], label: "G → U", description: "Go to Customers", action: "/admin/customers" },
  { keys: ["G", "N"], label: "G → N", description: "Go to Newsletter", action: "/admin/newsletter" },
  { keys: ["G", "F"], label: "G → F", description: "Go to FAQs", action: "/admin/faqs" },
  { keys: ["G", "S"], label: "G → S", description: "Go to Settings", action: "/admin/settings" },
  { keys: ["N", "P"], label: "N → P", description: "New Product", action: "/admin/products/new" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea/select or if modifier keys are held (except shift)
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toUpperCase();

      // ? to toggle help
      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Escape to close help
      if (e.key === "Escape" && showHelp) {
        setShowHelp(false);
        return;
      }

      // Check for two-key sequences
      if (pendingKey) {
        const combo = [pendingKey, key];
        const match = SHORTCUTS.find(
          (s) => s.keys[0] === combo[0] && s.keys[1] === combo[1]
        );
        if (match) {
          e.preventDefault();
          router.push(match.action);
          setShowHelp(false);
        }
        setPendingKey(null);
        return;
      }

      // Start a sequence if this is a first key
      if (key === "G" || key === "N") {
        setPendingKey(key);
        // Clear pending after timeout
        setTimeout(() => setPendingKey(null), 800);
      }
    },
    [pendingKey, router, showHelp]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-[fadeIn_100ms_ease-out]"
      onClick={() => setShowHelp(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-[slideUp_150ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-charcoal">
            Keyboard Shortcuts
          </h2>
          <kbd className="rounded border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted">
            ?
          </kbd>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Navigation
            </h3>
            <div className="space-y-1.5">
              {SHORTCUTS.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-charcoal">{s.description}</span>
                  <kbd className="rounded border border-border bg-surface px-2 py-0.5 text-xs font-mono font-medium text-muted">
                    {s.label}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Other
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-charcoal">Search</span>
                <kbd className="rounded border border-border bg-surface px-2 py-0.5 text-xs font-mono font-medium text-muted">
                  ⌘ K
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-charcoal">Show shortcuts</span>
                <kbd className="rounded border border-border bg-surface px-2 py-0.5 text-xs font-mono font-medium text-muted">
                  ?
                </kbd>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Press <kbd className="font-medium">Esc</kbd> or <kbd className="font-medium">?</kbd> to close
        </p>
      </div>
    </div>
  );
}
