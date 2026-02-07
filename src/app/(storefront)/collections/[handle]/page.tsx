import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SortDropdown from "@/components/storefront/SortDropdown";
import CollectionFilters from "@/components/storefront/CollectionFilters";
import CollectionProductList from "@/components/storefront/CollectionProductList";
import {
  getCollectionFilterDefs,
  extractSpecFilterValues,
  normalizeSpecValue,
  ALL_SPEC_PARAMS,
} from "@/lib/collection-filters";

const PER_PAGE = 24;

interface Props {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const supabase = await createClient();
  const { data: collection } = await supabase
    .from("collections")
    .select("title, description")
    .eq("handle", handle)
    .single();

  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.title,
    description:
      collection.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
      `Browse ${collection.title} at ElektroPolis Malta.`,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: Props) {
  const { handle } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  // Get collection
  const { data: collection } = await supabase
    .from("collections")
    .select("id, title, handle, description, image_url")
    .eq("handle", handle)
    .single();

  if (!collection) notFound();

  // Check if collection has any products
  const { count: collectionProductCount } = await supabase
    .from("product_collections")
    .select("product_id", { count: "exact", head: true })
    .eq("collection_id", collection.id);

  if (!collectionProductCount || collectionProductCount === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
        <CollectionHeader
          title={collection.title}
          handle={handle}
          count={0}
          sort={sp.sort}
        />
        <div className="text-center py-20">
          <p className="text-[15px] text-muted mb-2">
            No products in this collection yet.
          </p>
          <a
            href="/collections"
            className="text-[14px] font-medium text-brand hover:underline"
          >
            Browse all collections
          </a>
        </div>
      </div>
    );
  }

  // Get filter defs for this collection
  const filterDefs = getCollectionFilterDefs(handle);

  // Collect active spec filter params from URL
  const activeSpecFilters: Record<string, string> = {};
  for (const param of ALL_SPEC_PARAMS) {
    if (sp[param]) activeSpecFilters[param] = sp[param]!;
  }

  // Build query with inner join on product_collections (avoids large .in() queries)
  let query = supabase
    .from("products")
    .select(
      `
      id, title, handle, vendor, price, compare_at_price, inventory_count,
      specifications,
      product_images (url, alt_text, position, is_primary),
      product_collections!inner (collection_id)
    `,
      { count: "exact" }
    )
    .eq("status", "active")
    .eq("product_collections.collection_id", collection.id);

  // Apply standard filters
  if (sp.brand) {
    query = query.eq("vendor", sp.brand);
  }
  if (sp.minPrice) {
    query = query.gte("price", parseFloat(sp.minPrice));
  }
  if (sp.maxPrice) {
    query = query.lte("price", parseFloat(sp.maxPrice));
  }
  if (sp.inStock === "true") {
    query = query.gt("inventory_count", 0);
  }

  // Apply spec-based filters using JSONB contains
  for (const def of filterDefs) {
    const paramValue = sp[def.param];
    if (paramValue) {
      // Reverse the normalisation to match raw DB values.
      // We use contains(@>) to check the JSONB array includes the spec.
      // Since values are normalised on display, we need to search across
      // all products and match on normalised value — we do server-side
      // post-filtering below instead, which is simpler and correct.
    }
  }

  // Sort
  switch (sp.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("title", { ascending: true });
  }

  // We need to fetch more data when spec filters are active because
  // we do post-filtering on normalised spec values. Fetch up to 500
  // and slice after filtering.
  const hasSpecFilters = Object.keys(activeSpecFilters).length > 0;
  const fetchLimit = hasSpecFilters ? 500 : PER_PAGE;
  query = query.range(0, fetchLimit - 1);

  const { data: rawProducts, count: rawCount } = await query;

  // Build a param→specKey lookup from filter defs
  const paramToSpecKey = new Map(filterDefs.map((d) => [d.param, d.specKey]));

  // Post-filter by spec values (normalised comparison)
  let filteredProducts = rawProducts || [];
  if (hasSpecFilters) {
    filteredProducts = filteredProducts.filter((p) => {
      const specs: { key: string; value: string }[] =
        (p as Record<string, unknown>).specifications as { key: string; value: string }[] || [];
      for (const [param, value] of Object.entries(activeSpecFilters)) {
        const specKey = paramToSpecKey.get(param);
        if (!specKey) continue;
        const hasMatch = specs.some(
          (s) => s.key === specKey && normalizeSpecValue(s.value) === value
        );
        if (!hasMatch) return false;
      }
      return true;
    });
  }

  const totalCount = hasSpecFilters ? filteredProducts.length : (rawCount || 0);
  const products = hasSpecFilters
    ? filteredProducts.slice(0, PER_PAGE)
    : filteredProducts;

  // Get all products in collection for filter sidebar (brands + spec values)
  const { data: allProductsInCollection } = await supabase
    .from("products")
    .select("vendor, specifications, product_collections!inner (collection_id)")
    .eq("status", "active")
    .eq("product_collections.collection_id", collection.id);

  const brands = [
    ...new Set(
      (allProductsInCollection || [])
        .map((p) => p.vendor)
        .filter(Boolean) as string[]
    ),
  ].sort();

  // Extract available spec filter values from all products in collection
  const specFilterValues = extractSpecFilterValues(
    (allProductsInCollection || []) as { specifications?: { key: string; value: string }[] | null }[],
    filterDefs
  );

  const formattedProducts = (products || []).map((p) => ({
    ...p,
    images: ((p.product_images || []) as { url: string; alt_text: string | null; position: number }[])
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        url: img.url,
        alt_text: img.alt_text,
      })),
  }));

  // Build a filterKey that includes spec params
  const specKey = ALL_SPEC_PARAMS.map((p) => sp[p] || "").join("-");
  const filterKey = `${sp.sort}-${sp.brand}-${sp.minPrice}-${sp.maxPrice}-${sp.inStock}-${specKey}`;

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
      <CollectionHeader
        title={collection.title}
        handle={handle}
        count={totalCount}
        sort={sp.sort}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-[260px] shrink-0">
          <Suspense>
            <CollectionFilters
              brands={brands}
              specFilters={specFilterValues}
            />
          </Suspense>
        </aside>

        {/* Product grid with infinite scroll */}
        <div className="flex-1 min-w-0">
          {formattedProducts.length > 0 ? (
            <CollectionProductList
              key={filterKey}
              initialProducts={formattedProducts}
              totalCount={totalCount}
              collectionId={collection.id}
              collectionHandle={handle}
              filters={{
                sort: sp.sort,
                brand: sp.brand,
                minPrice: sp.minPrice,
                maxPrice: sp.maxPrice,
                inStock: sp.inStock,
                ...activeSpecFilters,
              }}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-[15px] text-muted mb-2">
                No products match your filters.
              </p>
              <a
                href={`/collections/${handle}`}
                className="text-[14px] font-medium text-brand hover:underline"
              >
                Clear all filters
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CollectionHeader({
  title,
  handle,
  count,
  sort,
}: {
  title: string;
  handle: string;
  count: number;
  sort?: string;
}) {
  return (
    <div className="mb-10">
      <nav className="text-[13px] text-muted mb-4">
        <a href="/" className="hover:text-charcoal transition-colors">
          Home
        </a>
        <span className="mx-2 text-border">/</span>
        <a
          href="/collections"
          className="hover:text-charcoal transition-colors"
        >
          Collections
        </a>
        <span className="mx-2 text-border">/</span>
        <span className="text-charcoal font-medium">{title}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[36px] font-bold text-charcoal tracking-tight mb-1">
            {title}
          </h1>
          <p className="text-[14px] text-muted">
            {count} {count === 1 ? "product" : "products"}
          </p>
        </div>

        <div className="shrink-0">
          <SortDropdown
            currentSort={sort}
            basePath={`/collections/${handle}`}
          />
        </div>
      </div>
    </div>
  );
}
