"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import type { SpecFilterValues } from "@/lib/collection-filters";

interface CollectionFiltersProps {
  brands: string[];
  specFilters?: SpecFilterValues[];
}

export default function CollectionFilters({
  brands,
  specFilters = [],
}: CollectionFiltersProps) {
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

  // Count active spec filters
  const activeSpecCount = specFilters.filter(
    (sf) => searchParams.get(sf.param)
  ).length;

  const hasActiveFilters =
    currentBrand ||
    currentMinPrice ||
    currentMaxPrice ||
    currentInStock ||
    activeSpecCount > 0;

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
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

  const activeFilterCount =
    (currentBrand ? 1 : 0) +
    (currentMinPrice ? 1 : 0) +
    (currentMaxPrice ? 1 : 0) +
    (currentInStock ? 1 : 0) +
    activeSpecCount;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal bg-white border border-border rounded-lg hover:bg-surface transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
        Filters
        {activeFilterCount > 0 && (
          <span className="min-w-[20px] h-5 flex items-center justify-center bg-brand text-white text-[11px] font-bold rounded-full px-1.5">
            {activeFilterCount}
          </span>
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
        {brands.length > 1 && (
          <FilterSection title="Brand">
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
          </FilterSection>
        )}

        {/* Dynamic spec-based filters */}
        {specFilters.map((sf) => (
          <SpecFilter
            key={sf.param}
            label={sf.label}
            param={sf.param}
            values={sf.values}
            currentValue={searchParams.get(sf.param) || ""}
            onUpdate={updateParams}
          />
        ))}

        {/* Price range */}
        <FilterSection title="Price Range">
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
        </FilterSection>

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
              <FilterTag
                label={currentBrand}
                onClear={() => updateParams({ brand: null })}
              />
            )}
            {specFilters.map((sf) => {
              const val = searchParams.get(sf.param);
              if (!val) return null;
              return (
                <FilterTag
                  key={sf.param}
                  label={`${sf.label}: ${val}`}
                  onClear={() => updateParams({ [sf.param]: null })}
                />
              );
            })}
            {currentMinPrice && (
              <FilterTag
                label={`Min: €${currentMinPrice}`}
                onClear={() => {
                  setMinPrice("");
                  updateParams({ minPrice: null });
                }}
              />
            )}
            {currentMaxPrice && (
              <FilterTag
                label={`Max: €${currentMaxPrice}`}
                onClear={() => {
                  setMaxPrice("");
                  updateParams({ maxPrice: null });
                }}
              />
            )}
            {currentInStock && (
              <FilterTag
                label="In Stock"
                onClear={() => updateParams({ inStock: null })}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FilterTag({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-light text-brand text-xs font-medium rounded-full">
      {label}
      <button onClick={onClear}>
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

const MAX_DEFAULT_VISIBLE = 6;

function SpecFilter({
  label,
  param,
  values,
  currentValue,
  onUpdate,
}: {
  label: string;
  param: string;
  values: string[];
  currentValue: string;
  onUpdate: (updates: Record<string, string | null>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const showToggle = values.length > MAX_DEFAULT_VISIBLE;
  const visible = expanded ? values : values.slice(0, MAX_DEFAULT_VISIBLE);

  return (
    <FilterSection title={label}>
      <div className="space-y-2">
        {visible.map((val) => (
          <label
            key={val}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <input
              type="radio"
              name={param}
              checked={currentValue === val}
              onChange={() =>
                onUpdate({ [param]: currentValue === val ? null : val })
              }
              className="w-4 h-4 text-brand border-border focus:ring-brand/20 accent-brand"
            />
            <span className="text-sm text-charcoal group-hover:text-brand transition-colors">
              {val}
            </span>
          </label>
        ))}
        {showToggle && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted hover:text-charcoal mt-1"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
            {expanded
              ? "Show less"
              : `Show ${values.length - MAX_DEFAULT_VISIBLE} more`}
          </button>
        )}
        {currentValue && (
          <button
            onClick={() => onUpdate({ [param]: null })}
            className="text-xs text-muted hover:text-charcoal mt-1"
          >
            Clear {label.toLowerCase()}
          </button>
        )}
      </div>
    </FilterSection>
  );
}
