"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } =
    useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch with persisted Zustand store
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-surface rounded w-48" />
          <div className="h-64 bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const itemCount = getItemCount();

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-10">
          <Link href="/" className="hover:text-charcoal transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-charcoal font-medium">Cart</span>
        </nav>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
            <ShoppingBag className="w-9 h-9 text-muted" strokeWidth={1.5} />
          </div>
          <h1 className="text-[24px] md:text-[28px] font-bold text-charcoal tracking-tight mb-3">
            Your cart is empty
          </h1>
          <p className="text-[15px] text-muted max-w-sm mb-8">
            Looks like you haven&apos;t added any products to your cart yet.
            Browse our collections to find what you need.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-brand hover:bg-brand-hover text-white text-[15px] font-semibold rounded-lg transition-colors"
          >
            Browse Collections
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-medium">Cart</span>
      </nav>

      <h1 className="text-[32px] md:text-[40px] font-bold text-charcoal tracking-tight mb-2">
        Shopping Cart
      </h1>
      <p className="text-[15px] text-muted mb-10">
        {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* ── Cart Items ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          {/* Header row - desktop */}
          <div className="hidden md:grid grid-cols-[1fr_140px_140px_48px] gap-4 pb-4 border-b border-border text-[12px] uppercase tracking-[0.1em] font-semibold text-muted">
            <span>Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || ""}`}
                className="py-6 md:grid md:grid-cols-[1fr_140px_140px_48px] md:gap-4 md:items-center"
              >
                {/* Product info */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-surface overflow-hidden flex-shrink-0 border border-border">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag
                          className="w-6 h-6 text-muted"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <Link
                      href={`/products/${item.handle}`}
                      className="text-[15px] font-semibold text-charcoal hover:text-brand transition-colors truncate"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[14px] font-medium text-charcoal">
                        {formatPrice(item.price)}
                      </span>
                      {item.compareAtPrice &&
                        item.compareAtPrice > item.price && (
                          <span className="text-[13px] text-muted line-through">
                            {formatPrice(item.compareAtPrice)}
                          </span>
                        )}
                    </div>
                    {item.sku && (
                      <span className="text-[12px] text-muted mt-0.5">
                        SKU: {item.sku}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity - mobile layout shifts below */}
                <div className="flex items-center justify-between mt-4 md:mt-0 md:justify-center">
                  <span className="text-[13px] text-muted md:hidden">
                    Quantity
                  </span>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.variantId
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center hover:bg-surface transition-colors text-muted hover:text-charcoal"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    <span className="w-10 h-9 flex items-center justify-center text-[14px] font-medium text-charcoal border-x border-border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.variantId
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center hover:bg-surface transition-colors text-muted hover:text-charcoal"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <div className="hidden md:flex justify-end">
                  <span className="text-[15px] font-semibold text-charcoal">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

                {/* Remove */}
                <div className="hidden md:flex justify-end">
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted hover:text-error transition-colors"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Mobile: total + remove row */}
                <div className="flex items-center justify-between mt-3 md:hidden">
                  <span className="text-[15px] font-semibold text-charcoal">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="flex items-center gap-1.5 text-[13px] text-muted hover:text-error transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Continue shopping */}
          <div className="mt-6 pt-6 border-t border-border">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-muted hover:text-brand transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" strokeWidth={2} />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Order Summary Sidebar ──────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
            <h2 className="text-[18px] font-bold text-charcoal mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 pb-4 border-b border-border">
              <div className="flex justify-between text-[14px]">
                <span className="text-muted">
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                <span className="font-medium text-charcoal">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-muted">Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
            </div>

            <div className="flex justify-between pt-4 mb-6">
              <span className="text-[16px] font-bold text-charcoal">Total</span>
              <span className="text-[18px] font-bold text-charcoal">
                {formatPrice(subtotal)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full h-12 bg-brand hover:bg-brand-hover text-white text-[15px] font-semibold rounded-lg transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center gap-3 text-[13px] text-muted">
                <Truck className="w-4 h-4 text-brand flex-shrink-0" strokeWidth={1.5} />
                <span>Free delivery across Malta & Gozo</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-muted">
                <Shield className="w-4 h-4 text-brand flex-shrink-0" strokeWidth={1.5} />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-muted">
                <RotateCcw className="w-4 h-4 text-brand flex-shrink-0" strokeWidth={1.5} />
                <span>Easy returns & exchanges</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
