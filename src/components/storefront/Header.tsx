"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { NAV_CATEGORIES } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuTimeout = useRef<NodeJS.Timeout | null>(null);
  const itemCount = useCartStore((s) => s.getItemCount());

  const handleMenuEnter = (title: string) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(title);
  };

  const handleMenuLeave = () => {
    menuTimeout.current = setTimeout(() => setActiveMenu(null), 150);
  };

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
            <nav className="hidden lg:flex items-center gap-1 ml-12">
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
                              href={`/collections/${item.handle}`}
                              className="block px-2 py-2 text-[14px] text-charcoal hover:text-brand hover:bg-brand-light rounded-md transition-colors"
                              onClick={() => setActiveMenu(null)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-border mt-3 pt-3">
                          <Link
                            href="/collections"
                            className="block px-2 py-1.5 text-[13px] font-medium text-brand hover:underline"
                            onClick={() => setActiveMenu(null)}
                          >
                            View all {category.title.toLowerCase()} &rarr;
                          </Link>
                        </div>
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
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-full hover:bg-surface transition-colors"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>

              {/* Account */}
              <Link
                href="/account"
                className="hidden sm:flex p-2.5 rounded-full hover:bg-surface transition-colors"
                aria-label="Account"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>

              {/* Cart */}
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
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={1.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2.5 text-[14px] bg-surface border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                >
                  <X className="w-4 h-4 text-muted hover:text-charcoal transition-colors" strokeWidth={1.5} />
                </button>
              </div>
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
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white animate-slide-in-right shadow-2xl flex flex-col"
            style={{ animationName: "slideInLeft" }}>
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
            <div className="flex-1 overflow-y-auto py-4 px-5">
              {NAV_CATEGORIES.map((category) => (
                <div key={category.title} className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">
                    {category.title}
                  </p>
                  <div className="space-y-0.5">
                    {category.items.map((item) => (
                      <Link
                        key={item.handle}
                        href={`/collections/${item.handle}`}
                        className="block py-2 text-[15px] text-charcoal hover:text-brand transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
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
