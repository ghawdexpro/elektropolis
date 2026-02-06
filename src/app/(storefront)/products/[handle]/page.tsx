import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductDetail from "./ProductDetail";

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
    </>
  );
}
