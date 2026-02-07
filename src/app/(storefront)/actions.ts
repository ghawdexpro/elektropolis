"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCollectionFilterDefs,
  normalizeSpecValue,
  ALL_SPEC_PARAMS,
} from "@/lib/collection-filters";

const PER_PAGE = 24;

export interface FormattedProduct {
  id: string;
  title: string;
  handle: string;
  vendor: string | null;
  price: number;
  compare_at_price: number | null;
  inventory_count: number;
  images: { url: string; alt_text: string | null }[];
}

interface LoadMoreResult {
  items: FormattedProduct[];
  hasMore: boolean;
}

function formatProducts(products: Record<string, unknown>[]): FormattedProduct[] {
  return products.map((p) => ({
    id: p.id as string,
    title: p.title as string,
    handle: p.handle as string,
    vendor: p.vendor as string | null,
    price: p.price as number,
    compare_at_price: p.compare_at_price as number | null,
    inventory_count: p.inventory_count as number,
    images: ((p.product_images as { url: string; alt_text: string | null; position: number }[]) || [])
      .sort((a, b) => a.position - b.position)
      .map((img) => ({ url: img.url, alt_text: img.alt_text })),
  }));
}

export async function loadCollectionProducts(params: {
  collectionId: string;
  collectionHandle?: string;
  page: number;
  sort?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  [key: string]: string | number | undefined;
}): Promise<LoadMoreResult> {
  const supabase = await createClient();

  // Collect active spec filters
  const activeSpecFilters: Record<string, string> = {};
  for (const param of ALL_SPEC_PARAMS) {
    if (params[param] && typeof params[param] === "string") {
      activeSpecFilters[param] = params[param] as string;
    }
  }
  const hasSpecFilters = Object.keys(activeSpecFilters).length > 0;

  let query = supabase
    .from("products")
    .select(
      `id, title, handle, vendor, price, compare_at_price, inventory_count, specifications,
       product_images (url, alt_text, position, is_primary),
       product_collections!inner (collection_id)`,
      { count: "exact" }
    )
    .eq("status", "active")
    .eq("product_collections.collection_id", params.collectionId);

  if (params.brand) query = query.eq("vendor", params.brand);
  if (params.minPrice) query = query.gte("price", parseFloat(params.minPrice));
  if (params.maxPrice) query = query.lte("price", parseFloat(params.maxPrice));
  if (params.inStock === "true") query = query.gt("inventory_count", 0);

  switch (params.sort) {
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

  if (hasSpecFilters) {
    // Fetch larger batch for post-filtering on normalised spec values
    query = query.range(0, 499);
  } else {
    const offset = (params.page - 1) * PER_PAGE;
    query = query.range(offset, offset + PER_PAGE - 1);
  }

  const { data: rawProducts, count } = await query;

  if (hasSpecFilters && params.collectionHandle) {
    // Post-filter by normalised spec values
    const filterDefs = getCollectionFilterDefs(params.collectionHandle);
    const paramToSpecKey = new Map(filterDefs.map((d) => [d.param, d.specKey]));

    let filtered = (rawProducts || []).filter((p) => {
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

    const totalCount = filtered.length;
    const offset = (params.page - 1) * PER_PAGE;
    const pageItems = filtered.slice(offset, offset + PER_PAGE);

    return {
      items: formatProducts(pageItems as Record<string, unknown>[]),
      hasMore: offset + pageItems.length < totalCount,
    };
  }

  const totalCount = count || 0;
  const items = formatProducts((rawProducts as Record<string, unknown>[]) || []);
  const offset = (params.page - 1) * PER_PAGE;

  return {
    items,
    hasMore: offset + items.length < totalCount,
  };
}

export async function loadSearchProducts(params: {
  query: string;
  sort?: string;
  page: number;
}): Promise<LoadMoreResult> {
  const supabase = await createClient();
  const q = params.query.trim();
  if (q.length < 2) return { items: [], hasMore: false };

  const PER_PAGE_SEARCH = PER_PAGE;
  const offset = (params.page - 1) * PER_PAGE_SEARCH;

  const tsQuery = q
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  // Build base select
  const selectCols = `id, title, handle, vendor, price, compare_at_price, inventory_count,
     product_images (url, alt_text, position, is_primary)`;

  // Try FTS first
  let ftsQuery = supabase
    .from("products")
    .select(selectCols, { count: "exact" })
    .eq("status", "active")
    .textSearch("search_vector", tsQuery);

  // Apply sort at DB level
  switch (params.sort) {
    case "price-asc":
      ftsQuery = ftsQuery.order("price", { ascending: true });
      break;
    case "price-desc":
      ftsQuery = ftsQuery.order("price", { ascending: false });
      break;
    default:
      // relevance / newest — keep default order
      break;
  }

  ftsQuery = ftsQuery.range(offset, offset + PER_PAGE_SEARCH - 1);
  const { data: ftsResults, count: ftsCount, error: ftsError } = await ftsQuery;

  if (!ftsError && ftsResults && ftsResults.length > 0) {
    return {
      items: formatProducts(ftsResults as Record<string, unknown>[]),
      hasMore: offset + ftsResults.length < (ftsCount || 0),
    };
  }

  // Fallback to ILIKE
  let fallbackQuery = supabase
    .from("products")
    .select(selectCols, { count: "exact" })
    .eq("status", "active")
    .or(`title.ilike.%${q}%,vendor.ilike.%${q}%,product_type.ilike.%${q}%`);

  switch (params.sort) {
    case "price-asc":
      fallbackQuery = fallbackQuery.order("price", { ascending: true });
      break;
    case "price-desc":
      fallbackQuery = fallbackQuery.order("price", { ascending: false });
      break;
    default:
      break;
  }

  fallbackQuery = fallbackQuery.range(offset, offset + PER_PAGE_SEARCH - 1);
  const { data: fallback, count: fallbackCount } = await fallbackQuery;

  const items = formatProducts((fallback as Record<string, unknown>[]) || []);
  return {
    items,
    hasMore: offset + items.length < (fallbackCount || 0),
  };
}
