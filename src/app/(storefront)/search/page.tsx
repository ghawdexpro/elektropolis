import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/storefront/ProductGrid";
import SortDropdown from "@/components/storefront/SortDropdown";
import { Search } from "lucide-react";

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

  let products: Array<{
    id: string;
    title: string;
    handle: string;
    vendor: string | null;
    price: number;
    compare_at_price: number | null;
    inventory_count: number;
    product_images: Array<{ url: string; alt_text: string | null; position: number }>;
  }> = [];

  if (query.length >= 2) {
    const tsQuery = query
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => `${w}:*`)
      .join(" & ");

    let dbQuery = supabase
      .from("products")
      .select(
        `id, title, handle, vendor, price, compare_at_price, inventory_count,
         product_images (url, alt_text, position, is_primary)`
      )
      .eq("status", "active");

    // Try full-text search first
    const { data: ftsResults, error } = await dbQuery.textSearch("search_vector", tsQuery);

    if (error || !ftsResults?.length) {
      // Fallback to ILIKE
      const { data: fallback } = await supabase
        .from("products")
        .select(
          `id, title, handle, vendor, price, compare_at_price, inventory_count,
           product_images (url, alt_text, position, is_primary)`
        )
        .eq("status", "active")
        .or(`title.ilike.%${query}%,vendor.ilike.%${query}%,product_type.ilike.%${query}%`);

      products = fallback || [];
    } else {
      products = ftsResults;
    }

    // Sort
    switch (sort) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Already sorted by relevance from FTS
        break;
      default:
        // Keep relevance order from FTS
        break;
    }
  }

  const formattedProducts = products.map((p) => ({
    ...p,
    images: (p.product_images || [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((img: { url: string; alt_text: string | null }) => ({
        url: img.url,
        alt_text: img.alt_text,
      })),
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
                {formattedProducts.length}{" "}
                {formattedProducts.length === 1 ? "product" : "products"} found
              </p>
            </div>
            {formattedProducts.length > 1 && (
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
        <ProductGrid products={formattedProducts} />
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
