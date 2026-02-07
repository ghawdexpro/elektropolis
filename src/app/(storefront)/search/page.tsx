import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SortDropdown from "@/components/storefront/SortDropdown";
import SearchResultsList from "@/components/storefront/SearchResultsList";
import { Search } from "lucide-react";

const PER_PAGE = 24;

interface Props {
  searchParams: Promise<{ q?: string; sort?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search Products",
    description: `Search results for "${q || ""}" at ElektroPolis Malta.`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, sort } = await searchParams;
  const query = q?.trim() || "";
  const supabase = await createClient();

  let products: Record<string, unknown>[] = [];
  let totalCount = 0;

  if (query.length >= 2) {
    const tsQuery = query
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => `${w}:*`)
      .join(" & ");

    const selectCols = `id, title, handle, vendor, price, compare_at_price, inventory_count,
         product_images (url, alt_text, position, is_primary)`;

    // Try FTS first
    let ftsQuery = supabase
      .from("products")
      .select(selectCols, { count: "exact" })
      .eq("status", "active")
      .textSearch("search_vector", tsQuery);

    // Sort at DB level for correct pagination
    switch (sort) {
      case "price-asc":
        ftsQuery = ftsQuery.order("price", { ascending: true });
        break;
      case "price-desc":
        ftsQuery = ftsQuery.order("price", { ascending: false });
        break;
      default:
        break;
    }

    ftsQuery = ftsQuery.range(0, PER_PAGE - 1);
    const { data: ftsResults, count: ftsCount, error } = await ftsQuery;

    if (!error && ftsResults && ftsResults.length > 0) {
      products = ftsResults as Record<string, unknown>[];
      totalCount = ftsCount || 0;
    } else {
      // Fallback to ILIKE
      let fallbackQuery = supabase
        .from("products")
        .select(selectCols, { count: "exact" })
        .eq("status", "active")
        .or(`title.ilike.%${query}%,vendor.ilike.%${query}%,product_type.ilike.%${query}%`);

      switch (sort) {
        case "price-asc":
          fallbackQuery = fallbackQuery.order("price", { ascending: true });
          break;
        case "price-desc":
          fallbackQuery = fallbackQuery.order("price", { ascending: false });
          break;
        default:
          break;
      }

      fallbackQuery = fallbackQuery.range(0, PER_PAGE - 1);
      const { data: fallback, count: fallbackCount } = await fallbackQuery;
      products = (fallback as Record<string, unknown>[]) || [];
      totalCount = fallbackCount || 0;
    }
  }

  const formattedProducts = products.map((p) => ({
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

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <nav className="text-[13px] text-muted mb-4">
          <a href="/" className="hover:text-charcoal transition-colors">Home</a>
          <span className="mx-2 text-border">/</span>
          <span className="text-charcoal font-medium">Search</span>
        </nav>

        {query ? (
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-[28px] md:text-[36px] font-bold text-charcoal tracking-tight mb-1">
                Results for &ldquo;{query}&rdquo;
              </h1>
              <p className="text-[14px] text-muted">
                {totalCount}{" "}
                {totalCount === 1 ? "product" : "products"} found
              </p>
            </div>
            {totalCount > 1 && (
              <div className="shrink-0">
                <SortDropdown currentSort={sort} basePath={`/search?q=${encodeURIComponent(query)}`} />
              </div>
            )}
          </div>
        ) : (
          <div>
            <h1 className="text-[28px] md:text-[36px] font-bold text-charcoal tracking-tight mb-1">
              Search Products
            </h1>
            <p className="text-[14px] text-muted">
              Enter a search term to find products.
            </p>
          </div>
        )}
      </div>

      {formattedProducts.length > 0 ? (
        <SearchResultsList
          key={`${query}-${sort}`}
          initialProducts={formattedProducts}
          totalCount={totalCount}
          query={query}
          sort={sort}
        />
      ) : query ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-muted" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] text-charcoal font-medium mb-2">
            No products found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-[13px] text-muted mb-6">
            Try checking the spelling or using different keywords.
          </p>
          <a
            href="/collections"
            className="text-[14px] font-medium text-brand hover:underline"
          >
            Browse all products
          </a>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-muted" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] text-muted">
            Use the search bar above to find products.
          </p>
        </div>
      )}
    </div>
  );
}
