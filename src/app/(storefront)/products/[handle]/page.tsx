import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductDetail from "./ProductDetail";
import ProductCard from "@/components/storefront/ProductCard";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "title, seo_title, seo_description, body_html, price, vendor, product_images(url)"
    )
    .eq("handle", handle)
    .eq("status", "active")
    .single();

  if (!product) return { title: "Product Not Found" };

  const description =
    product.seo_description ||
    product.body_html?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `Buy ${product.title} at ElektroPolis Malta.`;

  const image = product.product_images?.[0]?.url;

  return {
    title: product.seo_title || product.title,
    description,
    openGraph: {
      title: product.seo_title || product.title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      `
      id, title, handle, body_html, vendor, price, compare_at_price,
      inventory_count, sku, product_type, tags, currency,
      product_images (id, url, alt_text, width, height, position, is_primary),
      product_variants (id, title, price, compare_at_price, inventory_count, option1_name, option1_value, option2_name, option2_value, sku)
    `
    )
    .eq("handle", handle)
    .eq("status", "active")
    .single();

  if (!product) notFound();

  const images = (product.product_images || []).sort(
    (a: { position: number }, b: { position: number }) =>
      a.position - b.position
  );

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.map((img: { url: string }) => img.url),
    description: product.body_html?.replace(/<[^>]*>/g, "").slice(0, 500),
    brand: product.vendor
      ? { "@type": "Brand", name: product.vendor }
      : undefined,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.handle}`,
      priceCurrency: product.currency || "EUR",
      price: product.price,
      availability:
        product.inventory_count > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  // Fetch related products (same vendor or same collections, exclude current)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let relatedProducts: any[] = [];
  try {
    // First try: same vendor
    if (product.vendor) {
      const { data: sameVendor } = await supabase
        .from("products")
        .select(
          `id, title, handle, vendor, price, compare_at_price, inventory_count,
           product_images (url, alt_text, position, is_primary)`
        )
        .eq("status", "active")
        .eq("vendor", product.vendor)
        .neq("id", product.id)
        .limit(4);

      if (sameVendor && sameVendor.length > 0) {
        relatedProducts = sameVendor;
      }
    }

    // If not enough, try same collection
    if (relatedProducts.length < 4) {
      const { data: collectionIds } = await supabase
        .from("product_collections")
        .select("collection_id")
        .eq("product_id", product.id);

      if (collectionIds && collectionIds.length > 0) {
        const { data: siblingIds } = await supabase
          .from("product_collections")
          .select("product_id")
          .in(
            "collection_id",
            collectionIds.map((c) => c.collection_id)
          )
          .neq("product_id", product.id);

        const existingIds = new Set(relatedProducts.map((p: { id: string }) => p.id));
        const neededIds = (siblingIds || [])
          .map((s) => s.product_id)
          .filter((id) => !existingIds.has(id));

        if (neededIds.length > 0) {
          const { data: siblings } = await supabase
            .from("products")
            .select(
              `id, title, handle, vendor, price, compare_at_price, inventory_count,
               product_images (url, alt_text, position, is_primary)`
            )
            .eq("status", "active")
            .in("id", neededIds.slice(0, 4 - relatedProducts.length));

          if (siblings) {
            relatedProducts = [...relatedProducts, ...siblings];
          }
        }
      }
    }
  } catch {
    // Silently ignore related products errors
  }

  const formattedRelated = relatedProducts.slice(0, 4).map(
    (p: {
      id: string;
      title: string;
      handle: string;
      vendor: string | null;
      price: number;
      compare_at_price: number | null;
      inventory_count: number;
      product_images: { url: string; alt_text: string | null; position: number }[] | null;
    }) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      vendor: p.vendor,
      price: p.price,
      compare_at_price: p.compare_at_price,
      inventory_count: p.inventory_count,
      images: (p.product_images || [])
        .sort((a, b) => a.position - b.position)
        .map((img) => ({
          url: img.url,
          alt_text: img.alt_text,
        })),
    })
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail
        product={{
          ...product,
          images: images.map(
            (img: {
              id: string;
              url: string;
              alt_text: string | null;
              width: number;
              height: number;
            }) => ({
              id: img.id,
              url: img.url,
              alt_text: img.alt_text,
              width: img.width,
              height: img.height,
            })
          ),
          variants: product.product_variants || [],
        }}
      />

      {/* Related Products */}
      {formattedRelated.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-5 lg:px-8 py-16 md:py-20 border-t border-border">
          <h2 className="text-[22px] md:text-[26px] font-bold text-charcoal tracking-tight mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {formattedRelated.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
