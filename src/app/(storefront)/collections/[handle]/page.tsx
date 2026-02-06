import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/storefront/ProductGrid";
import SortDropdown from "@/components/storefront/SortDropdown";

interface Props {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string }>;
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
  const { sort } = await searchParams;
  const supabase = await createClient();

  // Get collection
  const { data: collection } = await supabase
    .from("collections")
    .select("id, title, handle, description, image_url")
    .eq("handle", handle)
    .single();

  if (!collection) notFound();

  // Get products in this collection
  const { data: productIds } = await supabase
    .from("product_collections")
    .select("product_id")
    .eq("collection_id", collection.id);

  const ids = productIds?.map((p) => p.product_id) || [];

  let query = supabase
    .from("products")
    .select(
      `
      id, title, handle, vendor, price, compare_at_price, inventory_count,
      product_images (url, alt_text, position, is_primary)
    `
    )
    .eq("status", "active")
    .in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);

  // Sort
  switch (sort) {
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

  const { data: products } = await query;

  const formattedProducts = (products || []).map((p) => ({
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
      {/* Header */}
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
          <span className="text-charcoal font-medium">{collection.title}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[36px] font-bold text-charcoal tracking-tight mb-1">
              {collection.title}
            </h1>
            <p className="text-[14px] text-muted">
              {formattedProducts.length}{" "}
              {formattedProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          {/* Sort */}
          <div className="shrink-0">
            <SortDropdown currentSort={sort} basePath={`/collections/${handle}`} />
          </div>
        </div>
      </div>

      {/* Product grid */}
      {formattedProducts.length > 0 ? (
        <ProductGrid products={formattedProducts} />
      ) : (
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
      )}
    </div>
  );
}
