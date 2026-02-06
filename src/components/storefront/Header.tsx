"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { NAV_CATEGORIES } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import CartDrawer from "./CartDrawer";

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  vendor: string | null;
  price: number;
}

export default function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const menuTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemCount = useCartStore((s) => s.getItemCount());

  const handleMenuEnter = (title: string) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(title);
  };

  const handleMenuLeave = () => {
    menuTimeout.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const doSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
      }
    } catch {
      // Silently fail for predictive search
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, doSearch]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-charcoal text-white text-center py-2 px-4 text-[13px] tracking-wide font-medium">
        Free delivery across Malta &amp; Gozo on all orders
      </div>

      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Left: Mobile menu + Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-1 -ml-1"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <Link href="/" className="flex items-center gap-0 shrink-0">
                <span className="text-[22px] font-bold tracking-tight text-charcoal">
                  Elektro
                </span>
                <span className="text-[22px] font-bold tracking-tight text-brand">
                  Polis
                </span>
              </Link>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 ml-10">
              {NAV_CATEGORIES.map((category) => (
                <div
                  key={category.title}
                  className="relative"
                  onMouseEnter={() => handleMenuEnter(category.title)}
                  onMouseLeave={handleMenuLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-[14px] font-medium transition-colors rounded-md",
                      activeMenu === category.title
                        ? "text-brand"
                        : "text-charcoal hover:text-brand"
                    )}
                  >
                    {category.title}
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        activeMenu === category.title && "rotate-180"
                      )}
                      strokeWidth={2}
                    />
                  </button>

                  {/* Dropdown */}
                  {activeMenu === category.title && (
                    <div
                      className="absolute top-full left-0 pt-2"
                      onMouseEnter={() => handleMenuEnter(category.title)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="bg-white rounded-lg border border-border shadow-lg shadow-black/[0.04] p-4 min-w-[260px] animate-scale-in">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-3 px-2">
                          {category.title}
                        </p>
                        <div className="space-y-0.5">
                          {category.items.map((item) => (
                            <Link
                              key={item.handle}
                              href={item.handle.startsWith("/") ? item.handle : `/collections/${item.handle}`}
                              className="block px-2 py-2 text-[14px] text-charcoal hover:text-brand hover:bg-brand-light rounded-md transition-colors"
                              onClick={() => setActiveMenu(null)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                        {category.title !== "Support" && (
                        <div className="border-t border-border mt-3 pt-3">
                          <Link
                            href="/collections"
                            className="block px-2 py-1.5 text-[13px] font-medium text-brand hover:underline"
                            onClick={() => setActiveMenu(null)}
                          >
                            View all {category.title.toLowerCase()} &rarr;
                          </Link>
                        </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Link
                href="/collections"
                className="px-3 py-2 text-[14px] font-medium text-charcoal hover:text-brand transition-colors rounded-md"
              >
                All Products
              </Link>
            </nav>

            {/* Right: Search, Account, Cart */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-full hover:bg-surface transition-colors"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>

              <Link
                href="/account"
                className="hidden sm:flex p-2.5 rounded-full hover:bg-surface transition-colors"
                aria-label="Account"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-surface transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar expand */}
        {searchOpen && (
          <div className="border-t border-border bg-white animate-fade-in">
            <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-4">
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={1.5} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2.5 text-[14px] bg-surface border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                >
                  <X className="w-4 h-4 text-muted hover:text-charcoal transition-colors" strokeWidth={1.5} />
                </button>

                {/* Predictive search dropdown */}
                {searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {searchLoading ? (
                      <div className="px-4 py-3 text-[13px] text-muted">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((result) => (
                          <Link
                            key={result.id}
                            href={`/products/${result.handle}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors border-b border-border last:border-0"
                            onClick={closeSearch}
                          >
                            <div className="flex-1 min-w-0">
                              {result.vendor && (
                                <p className="text-[11px] uppercase tracking-wider text-muted">{result.vendor}</p>
                              )}
                              <p className="text-[13px] font-medium text-charcoal truncate">{result.title}</p>
                              <p className="text-[13px] font-semibold text-brand">
                                {new Intl.NumberFormat("en-MT", { style: "currency", currency: "EUR" }).format(result.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          className="block px-4 py-3 text-[13px] font-medium text-brand hover:bg-surface transition-colors text-center border-t border-border"
                          onClick={closeSearch}
                        >
                          View all results &rarr;
                        </Link>
                      </>
                    ) : (
                      <div className="px-4 py-3 text-[13px] text-muted">
                        No products found for &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-overlay animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white animate-slide-in-left shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-[72px] border-b border-border">
              <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
                <span className="text-[20px] font-bold tracking-tight text-charcoal">
                  Elektro
                </span>
                <span className="text-[20px] font-bold tracking-tight text-brand">
                  Polis
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Mobile search */}
            <div className="px-5 py-3 border-b border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setMobileOpen(false);
                    setSearchQuery("");
                  }
                }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={1.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-surface border border-border rounded-lg focus:outline-none focus:border-brand"
                />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-5">
              {NAV_CATEGORIES.map((category) => (
                <div key={category.title} className="mb-2">
                  <button
                    onClick={() => setMobileSubmenu(mobileSubmenu === category.title ? null : category.title)}
                    className="flex items-center justify-between w-full py-3 text-[15px] font-medium text-charcoal"
                  >
                    {category.title}
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-muted transition-transform duration-200",
                        mobileSubmenu === category.title && "rotate-90"
                      )}
                      strokeWidth={2}
                    />
                  </button>
                  {mobileSubmenu === category.title && (
                    <div className="pl-4 pb-2 space-y-0.5 animate-fade-in">
                      {category.items.map((item) => (
                        <Link
                          key={item.handle}
                          href={item.handle.startsWith("/") ? item.handle : `/collections/${item.handle}`}
                          className="block py-2 text-[14px] text-muted hover:text-brand transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t border-border pt-4 mt-2">
                <Link
                  href="/collections"
                  className="block py-2 text-[15px] font-medium text-brand"
                  onClick={() => setMobileOpen(false)}
                >
                  View All Products
                </Link>
                <Link
                  href="/account"
                  className="block py-2 text-[15px] text-charcoal hover:text-brand transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  href="/contact"
                  className="block py-2 text-[15px] text-charcoal hover:text-brand transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact Us
                </Link>
                <Link
                  href="/faqs"
                  className="block py-2 text-[15px] text-charcoal hover:text-brand transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
