"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderOpen,
  Users,
  Settings,
  Mail,
  HelpCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  section: string;
  keywords?: string[];
}

const COMMANDS: CommandItem[] = [
  // Navigation
  { id: "nav-dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin", section: "Navigate", keywords: ["home", "overview"] },
  { id: "nav-products", label: "Products", icon: Package, href: "/admin/products", section: "Navigate", keywords: ["catalog", "items"] },
  { id: "nav-collections", label: "Collections", icon: FolderOpen, href: "/admin/collections", section: "Navigate", keywords: ["categories"] },
  { id: "nav-orders", label: "Orders", icon: ShoppingCart, href: "/admin/orders", section: "Navigate", keywords: ["sales"] },
  { id: "nav-customers", label: "Customers", icon: Users, href: "/admin/customers", section: "Navigate", keywords: ["buyers", "clients"] },
  { id: "nav-newsletter", label: "Newsletter", icon: Mail, href: "/admin/newsletter", section: "Navigate", keywords: ["email", "subscribers"] },
  { id: "nav-faqs", label: "FAQs", icon: HelpCircle, href: "/admin/faqs", section: "Navigate", keywords: ["questions", "help"] },
  { id: "nav-settings", label: "Settings", icon: Settings, href: "/admin/settings", section: "Navigate", keywords: ["config", "preferences"] },
  // Actions
  { id: "act-new-product", label: "New Product", description: "Create a new product", icon: Plus, href: "/admin/products/new", section: "Actions", keywords: ["add", "create"] },
  { id: "act-new-faq", label: "New FAQ", description: "Create a new FAQ", icon: Plus, href: "/admin/faqs/new", section: "Actions", keywords: ["add", "create", "question"] },
];

function fuzzyMatch(query: string, item: CommandItem): boolean {
  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.description?.toLowerCase().includes(q)) return true;
  if (item.keywords?.some((k) => k.includes(q))) return true;
  return false;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    return COMMANDS.filter((item) => fuzzyMatch(query, item));
  }, [query]);

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const arr = map.get(item.section) || [];
      arr.push(item);
      map.set(item.section, arr);
    }
    return map;
  }, [filtered]);

  const flatItems = useMemo(() => filtered, [filtered]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      // Small delay to let the modal render
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-command-item]");
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const executeItem = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      if (item.href) {
        router.push(item.href);
      } else if (item.action) {
        item.action();
      }
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flatItems[selectedIndex]) {
        e.preventDefault();
        executeItem(flatItems[selectedIndex]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [flatItems, selectedIndex, executeItem]
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  let runningIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[3px] animate-[fadeIn_100ms_ease-out]"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh]">
        <div
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-black/20 animate-[slideUp_150ms_cubic-bezier(0.16,1,0.3,1)]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4.5 w-4.5 shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, actions..."
              className="flex-1 border-0 bg-transparent py-3.5 text-sm text-charcoal placeholder:text-muted/50 focus:outline-none"
            />
            <kbd className="hidden rounded-md border border-border bg-surface/60 px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
            {flatItems.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted">
                No results found.
              </div>
            ) : (
              Array.from(grouped.entries()).map(([section, items]) => (
                <div key={section} className="mb-1 last:mb-0">
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted/60">
                    {section}
                  </p>
                  {items.map((item) => {
                    const itemIndex = runningIndex++;
                    const isSelected = itemIndex === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        data-command-item
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-75",
                          isSelected
                            ? "bg-brand/[0.08] text-charcoal"
                            : "text-charcoal hover:bg-surface/60"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isSelected ? "text-brand" : "text-muted"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="ml-2 text-xs text-muted">
                              {item.description}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-border bg-surface/30 px-4 py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-muted">
              <kbd className="rounded border border-border bg-white px-1 py-0.5 font-mono text-[10px]">&uarr;</kbd>
              <kbd className="rounded border border-border bg-white px-1 py-0.5 font-mono text-[10px]">&darr;</kbd>
              <span>navigate</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted">
              <kbd className="rounded border border-border bg-white px-1.5 py-0.5 font-mono text-[10px]">&crarr;</kbd>
              <span>select</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
