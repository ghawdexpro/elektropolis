"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const total = getTotal();
  const count = getItemCount();

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-overlay animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="text-[15px] font-semibold">
              Cart{count > 0 && ` (${count})`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Cart items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-muted" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-medium text-charcoal mb-1">
              Your cart is empty
            </p>
            <p className="text-[13px] text-muted mb-6">
              Browse our collections and find something you love.
            </p>
            <button
              onClick={onClose}
              className="text-[13px] font-semibold text-brand hover:underline"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || ""}`}
                  className="flex gap-4 py-3 border-b border-border last:border-0"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.handle}`}
                    onClick={onClose}
                    className="w-20 h-20 bg-surface rounded-md overflow-hidden shrink-0 relative"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-1.5"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-muted" strokeWidth={1.5} />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.handle}`}
                      onClick={onClose}
                      className="text-[13px] font-medium text-charcoal leading-snug line-clamp-2 hover:text-brand transition-colors"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[14px] font-semibold text-charcoal">
                        {formatPrice(item.price)}
                      </span>
                      {item.compareAtPrice && (
                        <span className="text-[12px] text-muted line-through">
                          {formatPrice(item.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantId
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" strokeWidth={2} />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-[13px] font-medium border-x border-border">
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
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" strokeWidth={2} />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
                        className="text-[12px] text-muted hover:text-error transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-5 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-muted">Subtotal</span>
                <span className="text-[18px] font-semibold text-charcoal">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="text-[12px] text-muted">
                Shipping calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full h-12 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg flex items-center justify-center transition-colors"
              >
                Checkout &mdash; {formatPrice(total)}
              </Link>
              <button
                onClick={onClose}
                className="w-full text-center text-[13px] font-medium text-muted hover:text-charcoal transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
