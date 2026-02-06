"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatPrice, getStockLabel, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    vendor: string | null;
    price: number;
    compare_at_price: number | null;
    inventory_count: number;
    images: { url: string; alt_text: string | null }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const stock = getStockLabel(product.inventory_count);
  const primaryImage = product.images?.[0];
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inventory_count <= 0) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      compareAtPrice: product.compare_at_price ?? undefined,
      image: primaryImage?.url,
      handle: product.handle,
    });
  };

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block"
    >
      {/* Image container */}
      <div className="relative aspect-square bg-surface rounded-lg overflow-hidden mb-3">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text || product.title}
            fill
            className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted text-[13px]">No image</span>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-brand text-white text-[11px] font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        )}

        {/* Stock badge if low/sold out */}
        {product.inventory_count <= 10 && (
          <span
            className={cn(
              "absolute top-3 right-3 text-[11px] font-semibold px-2 py-1 rounded",
              product.inventory_count <= 0
                ? "bg-charcoal/90 text-white"
                : "bg-white/90 text-brand border border-brand/20"
            )}
          >
            {stock.label}
          </span>
        )}

        {/* Quick add button */}
        {product.inventory_count > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-10 h-10 bg-charcoal text-white rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-1">
        {product.vendor && (
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">
            {product.vendor}
          </p>
        )}
        <h3 className="text-[14px] font-medium text-charcoal leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-[15px] font-semibold text-charcoal">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[13px] text-muted line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
