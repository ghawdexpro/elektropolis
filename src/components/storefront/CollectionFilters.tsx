"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

interface CollectionFiltersProps {
  brands: string[];
}

export default function CollectionFilters({ brands }: CollectionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const currentBrand = searchParams.get("brand") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentInStock = searchParams.get("inStock") === "true";

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const hasActiveFilters =
    currentBrand || currentMinPrice || currentMaxPrice || currentInStock;

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    // Reset page when filters change
    params.delete("page");
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    router.push(`${pathname}?${params.toString()}`);
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal bg-white border border-border rounded-lg hover:bg-surface transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
        Filters
        {hasActiveFilters && (
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
        )}
      </button>

      {/* Filter panel */}
      <div
        className={`${
          open ? "block" : "hidden"
        } lg:block bg-white border border-border rounded-xl p-5 space-y-6`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wide">
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-brand hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Brand filter */}
        {brands.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
              Brand
            </h4>
            <div className="space-y-2">
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="brand"
                    checked={currentBrand === brand}
                    onChange={() =>
                      updateParams({
                        brand: currentBrand === brand ? null : brand,
                      })
                    }
                    className="w-4 h-4 text-brand border-border focus:ring-brand/20 accent-brand"
                  />
                  <span className="text-sm text-charcoal group-hover:text-brand transition-colors">
                    {brand}
                  </span>
                </label>
              ))}
              {currentBrand && (
                <button
                  onClick={() => updateParams({ brand: null })}
                  className="text-xs text-muted hover:text-charcoal mt-1"
                >
                  Clear brand
                </button>
              )}
            </div>
          </div>
        )}

        {/* Price range */}
        <div>
          <h4 className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
            Price Range
          </h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={() => updateParams({ minPrice: minPrice || null })}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  updateParams({ minPrice: minPrice || null });
              }}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <span className="text-muted text-xs">to</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={() => updateParams({ maxPrice: maxPrice || null })}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  updateParams({ maxPrice: maxPrice || null });
              }}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>
        </div>

        {/* In stock toggle */}
        <div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={currentInStock}
              onChange={() =>
                updateParams({
                  inStock: currentInStock ? null : "true",
                })
              }
              className="w-4 h-4 text-brand border-border rounded focus:ring-brand/20 accent-brand"
            />
            <span className="text-sm text-charcoal">In stock only</span>
          </label>
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {currentBrand && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-light text-brand text-xs font-medium rounded-full">
                {currentBrand}
                <button onClick={() => updateParams({ brand: null })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentMinPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-light text-brand text-xs font-medium rounded-full">
                Min: €{currentMinPrice}
                <button
                  onClick={() => {
                    setMinPrice("");
                    updateParams({ minPrice: null });
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentMaxPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-light text-brand text-xs font-medium rounded-full">
                Max: €{currentMaxPrice}
                <button
                  onClick={() => {
                    setMaxPrice("");
                    updateParams({ maxPrice: null });
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentInStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-light text-brand text-xs font-medium rounded-full">
                In Stock
                <button onClick={() => updateParams({ inStock: null })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
