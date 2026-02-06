import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/storefront/ProductGrid";
import SortDropdown from "@/components/storefront/SortDropdown";
import CollectionFilters from "@/components/storefront/CollectionFilters";
import Pagination from "@/components/storefront/Pagination";

const PER_PAGE = 24;

interface Props {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{
    sort?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    page?: string;
  }>;
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

  // Get product IDs in this collection
  const { data: productIds } = await supabase
    .from("product_collections")
    .select("product_id")
    .eq("collection_id", collection.id);

  const ids = productIds?.map((p) => p.product_id) || [];

  if (ids.length === 0) {
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

  // Build query with filters
  let query = supabase
    .from("products")
    .select(
      `
      id, title, handle, vendor, price, compare_at_price, inventory_count,
      product_images (url, alt_text, position, is_primary)
    `,
      { count: "exact" }
    )
    .eq("status", "active")
    .in("id", ids);

  // Apply filters
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

  // Pagination
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const offset = (page - 1) * PER_PAGE;
  query = query.range(offset, offset + PER_PAGE - 1);

  const { data: products, count } = await query;
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  // Get unique brands for filter sidebar
  const { data: allProductsInCollection } = await supabase
    .from("products")
    .select("vendor")
    .eq("status", "active")
    .in("id", ids);

  const brands = [
    ...new Set(
      (allProductsInCollection || [])
        .map((p) => p.vendor)
        .filter(Boolean) as string[]
    ),
  ].sort();

  const formattedProducts = (products || []).map((p) => ({
    ...p,
    images: (p.product_images || [])
      .sort(
        (a: { position: number }, b: { position: number }) =>
          a.position - b.position
      )
      .map((img: { url: string; alt_text: string | null }) => ({
        url: img.url,
        alt_text: img.alt_text,
      })),
  }));

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
            <CollectionFilters brands={brands} />
          </Suspense>
        </aside>

        {/* Product grid + pagination */}
        <div className="flex-1 min-w-0">
          {formattedProducts.length > 0 ? (
            <>
              <ProductGrid products={formattedProducts} />
              <Suspense>
                <Pagination currentPage={page} totalPages={totalPages} />
              </Suspense>
            </>
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
