"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  RotateCcw,
  Shield,
  Check,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice, getStockLabel, cn } from "@/lib/utils";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  width: number;
  height: number;
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  inventory_count: number;
  option1_name: string | null;
  option1_value: string | null;
  option2_name: string | null;
  option2_value: string | null;
  sku: string | null;
}

interface ProductDocument {
  id: string;
  url: string;
  title: string;
  type: string;
  position: number;
}

interface ProductSpec {
  key: string;
  value: string;
}

interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    handle: string;
    body_html: string | null;
    vendor: string | null;
    price: number;
    compare_at_price: number | null;
    inventory_count: number;
    sku: string | null;
    product_type: string | null;
    tags: string[] | null;
    images: ProductImage[];
    variants: ProductVariant[];
    specifications: ProductSpec[];
    documents: ProductDocument[];
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "documents">(
    product.body_html ? "description" : product.specifications.length > 0 ? "specifications" : "documents"
  );
  const addItem = useCartStore((s) => s.addItem);

  const stock = getStockLabel(product.inventory_count);
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price) /
          product.compare_at_price!) *
          100
      )
    : 0;
  const currentImage = product.images[selectedImage];
  const inStock = product.inventory_count > 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      compareAtPrice: product.compare_at_price ?? undefined,
      image: product.images[0]?.url,
      handle: product.handle,
      sku: product.sku ?? undefined,
    }, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="text-[13px] text-muted mb-8">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span className="mx-2 text-border">/</span>
        <Link
          href="/collections"
          className="hover:text-charcoal transition-colors"
        >
          Products
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-charcoal font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Image Gallery ─────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="aspect-square bg-surface rounded-xl overflow-hidden relative">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={currentImage.alt_text || product.title}
                fill
                className="object-contain p-6 md:p-10"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-muted text-[14px]">No image available</span>
              </div>
            )}

            {/* Discount badge */}
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-brand text-white text-[12px] font-bold px-3 py-1.5 rounded-md">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "w-20 h-20 rounded-lg overflow-hidden bg-surface shrink-0 relative border-2 transition-colors",
                    selectedImage === i
                      ? "border-brand"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt_text || `${product.title} ${i + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ──────────────────────────── */}
        <div className="lg:py-4">
          {/* Brand */}
          {product.vendor && (
            <p className="text-[12px] uppercase tracking-[0.1em] text-muted font-semibold mb-2">
              {product.vendor}
            </p>
          )}

          {/* Title */}
          <h1 className="text-[26px] md:text-[32px] font-bold text-charcoal tracking-tight leading-tight mb-4">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-[28px] font-bold text-charcoal">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-[18px] text-muted line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
                <span className="text-[13px] font-semibold text-brand bg-brand-light px-2 py-0.5 rounded">
                  Save {formatPrice(product.compare_at_price! - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                inStock ? "bg-success" : "bg-error"
              )}
            />
            <span className={cn("text-[13px] font-medium", stock.color)}>
              {stock.label}
            </span>
            {product.sku && (
              <span className="text-[12px] text-muted ml-2">
                SKU: {product.sku}
              </span>
            )}
          </div>

          <div className="h-px bg-border mb-6" />

          {/* Quantity + Add to cart */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-surface transition-colors rounded-l-lg"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <span className="w-12 h-11 flex items-center justify-center text-[14px] font-semibold border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center hover:bg-surface transition-colors rounded-r-lg"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={cn(
                  "flex-1 h-12 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 transition-all",
                  inStock
                    ? addedToCart
                      ? "bg-success text-white"
                      : "bg-charcoal hover:bg-brand text-white"
                    : "bg-surface text-muted cursor-not-allowed"
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} />
                    Added to Cart
                  </>
                ) : inStock ? (
                  <>
                    <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                    Add to Cart
                  </>
                ) : (
                  "Sold Out"
                )}
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Truck, label: "Free Delivery" },
              { icon: RotateCcw, label: "Easy Returns" },
              { icon: Shield, label: "Warranty" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 py-3 bg-surface rounded-lg"
              >
                <Icon
                  className="w-4 h-4 text-muted"
                  strokeWidth={1.5}
                />
                <span className="text-[11px] font-medium text-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Product Info Tabs */}
          {(product.body_html || product.specifications.length > 0 || product.documents.length > 0) && (
            <div className="border-t border-border pt-6">
              {/* Tab headers */}
              <div className="flex gap-0 border-b border-border mb-6">
                {product.body_html && (
                  <button
                    onClick={() => setActiveTab("description")}
                    className={cn(
                      "text-[13px] font-semibold uppercase tracking-[0.06em] px-4 py-3 border-b-2 transition-colors -mb-px",
                      activeTab === "description"
                        ? "border-brand text-charcoal"
                        : "border-transparent text-muted hover:text-charcoal"
                    )}
                  >
                    Description
                  </button>
                )}
                {product.specifications.length > 0 && (
                  <button
                    onClick={() => setActiveTab("specifications")}
                    className={cn(
                      "text-[13px] font-semibold uppercase tracking-[0.06em] px-4 py-3 border-b-2 transition-colors -mb-px",
                      activeTab === "specifications"
                        ? "border-brand text-charcoal"
                        : "border-transparent text-muted hover:text-charcoal"
                    )}
                  >
                    Specifications
                  </button>
                )}
                {product.documents.length > 0 && (
                  <button
                    onClick={() => setActiveTab("documents")}
                    className={cn(
                      "text-[13px] font-semibold uppercase tracking-[0.06em] px-4 py-3 border-b-2 transition-colors -mb-px",
                      activeTab === "documents"
                        ? "border-brand text-charcoal"
                        : "border-transparent text-muted hover:text-charcoal"
                    )}
                  >
                    Documents
                  </button>
                )}
              </div>

              {/* Tab content */}
              {activeTab === "description" && product.body_html && (
                <div
                  className="prose prose-sm max-w-none text-[14px] text-muted leading-relaxed
                    [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px]
                    [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2
                    [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-charcoal [&_th]:bg-surface
                    [&_strong]:text-charcoal [&_strong]:font-semibold
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                    [&_p]:mb-3"
                  dangerouslySetInnerHTML={{ __html: product.body_html }}
                />
              )}

              {activeTab === "specifications" && product.specifications.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden">
                  {product.specifications.map((spec, i) => (
                    <div
                      key={`${spec.key}-${i}`}
                      className={cn(
                        "grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] text-[13px]",
                        i % 2 === 0 ? "bg-surface" : "bg-white",
                        i < product.specifications.length - 1 && "border-b border-border"
                      )}
                    >
                      <div className="px-4 py-3 font-medium text-charcoal">
                        {spec.key}
                      </div>
                      <div className="px-4 py-3 text-muted">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "documents" && product.documents.length > 0 && (
                <div className="space-y-2">
                  {product.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-brand/30 hover:bg-brand-light/30 transition-colors group"
                    >
                      <FileText className="w-5 h-5 text-muted group-hover:text-brand shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-charcoal truncate">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-muted uppercase tracking-wide">
                          {doc.type}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted group-hover:text-brand shrink-0" strokeWidth={1.5} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-muted bg-surface border border-border px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
