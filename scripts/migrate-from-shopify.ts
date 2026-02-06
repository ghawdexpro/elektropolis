/**
 * Shopify -> Supabase Migration Script for ElektroPolis
 *
 * Pulls all products, collections, and images from Shopify's public JSON API
 * and inserts them into the Supabase database + storage.
 *
 * Usage: npx tsx scripts/migrate-from-shopify.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const SHOPIFY_STORE = "https://elektropolis.mt";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Types ───────────────────────────────────────────────────────
interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  tags: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  options: { name: string; values: string[] }[];
}

interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  weight: number;
  weight_unit: string;
}

interface ShopifyImage {
  id: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
  position: number;
}

interface ShopifyCollection {
  id: number;
  handle: string;
  title: string;
  body_html: string;
  image: { src: string } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function downloadAndUploadImage(
  imageUrl: string,
  storagePath: string
): Promise<string> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from("product-images")
      .upload(storagePath, buffer, {
        contentType: blob.type || "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    return data.publicUrl;
  } catch (err) {
    console.warn(`  ⚠ Failed to upload image ${storagePath}:`, err);
    // Fall back to Shopify CDN URL
    return imageUrl;
  }
}

// ─── Fetch from Shopify ──────────────────────────────────────────

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let page = 1;

  while (true) {
    const url = `${SHOPIFY_STORE}/products.json?limit=250&page=${page}`;
    console.log(`Fetching products page ${page}...`);
    const data = await fetchJSON<{ products: ShopifyProduct[] }>(url);
    if (data.products.length === 0) break;
    allProducts.push(...data.products);
    page++;
  }

  console.log(`Found ${allProducts.length} products total`);
  return allProducts;
}

async function fetchAllCollections(): Promise<ShopifyCollection[]> {
  const data = await fetchJSON<{ collections: ShopifyCollection[] }>(
    `${SHOPIFY_STORE}/collections.json`
  );
  console.log(`Found ${data.collections.length} collections`);
  return data.collections;
}

async function fetchCollectionProducts(
  handle: string
): Promise<ShopifyProduct[]> {
  try {
    const data = await fetchJSON<{ products: ShopifyProduct[] }>(
      `${SHOPIFY_STORE}/collections/${handle}/products.json?limit=250`
    );
    return data.products;
  } catch {
    return [];
  }
}

// ─── Insert into Supabase ────────────────────────────────────────

async function migrateBrands(
  products: ShopifyProduct[]
): Promise<Map<string, string>> {
  const vendorSet = new Set(products.map((p) => p.vendor).filter(Boolean));
  const brandMap = new Map<string, string>();

  console.log(`\nInserting ${vendorSet.size} brands...`);

  for (const vendor of vendorSet) {
    const { data, error } = await supabase
      .from("brands")
      .upsert(
        { name: vendor, slug: slugify(vendor) },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error) {
      console.error(`  ✗ Brand "${vendor}":`, error.message);
      continue;
    }
    brandMap.set(vendor, data.id);
    console.log(`  ✓ Brand: ${vendor}`);
  }

  return brandMap;
}

async function migrateCollections(
  collections: ShopifyCollection[]
): Promise<Map<string, string>> {
  const collectionMap = new Map<string, string>();

  console.log(`\nInserting ${collections.length} collections...`);

  for (const col of collections) {
    let imageUrl = col.image?.src || null;

    // Upload collection image if exists
    if (imageUrl) {
      imageUrl = await downloadAndUploadImage(
        imageUrl,
        `collections/${col.handle}.jpg`
      );
    }

    const { data, error } = await supabase
      .from("collections")
      .upsert(
        {
          title: col.title,
          handle: col.handle,
          description: col.body_html || null,
          image_url: imageUrl,
          shopify_id: col.id,
          is_visible: true,
        },
        { onConflict: "handle" }
      )
      .select("id")
      .single();

    if (error) {
      console.error(`  ✗ Collection "${col.title}":`, error.message);
      continue;
    }
    collectionMap.set(col.handle, data.id);
    console.log(`  ✓ Collection: ${col.title}`);
  }

  return collectionMap;
}

async function migrateProducts(
  products: ShopifyProduct[],
  brandMap: Map<string, string>
): Promise<Map<number, string>> {
  const productMap = new Map<number, string>(); // shopify_id -> supabase_id

  console.log(`\nInserting ${products.length} products...`);

  for (const product of products) {
    const primaryVariant = product.variants[0];
    const price = parseFloat(primaryVariant?.price || "0");
    const compareAtPrice = primaryVariant?.compare_at_price
      ? parseFloat(primaryVariant.compare_at_price)
      : null;
    const tags = Array.isArray(product.tags)
      ? product.tags
      : typeof product.tags === "string"
        ? product.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];

    // Insert product
    const { data: productData, error: productError } = await supabase
      .from("products")
      .upsert(
        {
          title: product.title,
          handle: product.handle,
          body_html: product.body_html,
          vendor: product.vendor,
          brand_id: brandMap.get(product.vendor) || null,
          product_type: product.product_type || null,
          status: "active",
          tags,
          price,
          compare_at_price: compareAtPrice,
          currency: "EUR",
          sku: primaryVariant?.sku || null,
          inventory_count: primaryVariant?.available ? 10 : 0,
          weight_grams: primaryVariant
            ? Math.round(
                primaryVariant.weight *
                  (primaryVariant.weight_unit === "kg" ? 1000 : 1)
              )
            : 0,
          shopify_id: product.id,
          shopify_variant_id: primaryVariant?.id || null,
        },
        { onConflict: "handle" }
      )
      .select("id")
      .single();

    if (productError) {
      console.error(`  ✗ Product "${product.title}":`, productError.message);
      continue;
    }

    const productId = productData.id;
    productMap.set(product.id, productId);

    // Upload and insert images
    for (const image of product.images) {
      const ext = image.src.split("?")[0].split(".").pop() || "jpg";
      const storagePath = `products/${product.handle}/${image.position}.${ext}`;
      const uploadedUrl = await downloadAndUploadImage(image.src, storagePath);

      await supabase.from("product_images").upsert(
        {
          product_id: productId,
          url: uploadedUrl,
          alt_text: image.alt || product.title,
          width: image.width,
          height: image.height,
          position: image.position,
          is_primary: image.position === 1,
        },
        { onConflict: "id" }
      );
    }

    // Insert variants (if more than 1)
    if (product.variants.length > 1) {
      for (const variant of product.variants) {
        const options = product.options || [];
        await supabase.from("product_variants").upsert(
          {
            product_id: productId,
            title: variant.title,
            sku: variant.sku || null,
            price: parseFloat(variant.price),
            compare_at_price: variant.compare_at_price
              ? parseFloat(variant.compare_at_price)
              : null,
            inventory_count: variant.available ? 10 : 0,
            option1_name: options[0]?.name || null,
            option1_value: variant.option1,
            option2_name: options[1]?.name || null,
            option2_value: variant.option2,
            option3_name: options[2]?.name || null,
            option3_value: variant.option3,
            weight_grams: Math.round(
              variant.weight *
                (variant.weight_unit === "kg" ? 1000 : 1)
            ),
            shopify_id: variant.id,
          },
          { onConflict: "id" }
        );
      }
    }

    console.log(
      `  ✓ Product: ${product.title} (${product.images.length} images, ${product.variants.length} variants)`
    );
  }

  return productMap;
}

async function migrateCollectionMappings(
  collections: ShopifyCollection[],
  collectionMap: Map<string, string>,
  productShopifyMap: Map<number, string>
) {
  console.log("\nMapping products to collections...");

  for (const col of collections) {
    const collectionId = collectionMap.get(col.handle);
    if (!collectionId) continue;

    const products = await fetchCollectionProducts(col.handle);
    let mapped = 0;

    for (const product of products) {
      const productId = productShopifyMap.get(product.id);
      if (!productId) continue;

      const { error } = await supabase.from("product_collections").upsert(
        {
          product_id: productId,
          collection_id: collectionId,
          position: 0,
        },
        { onConflict: "product_id,collection_id" }
      );

      if (!error) mapped++;
    }

    if (mapped > 0) {
      console.log(`  ✓ ${col.title}: ${mapped} products mapped`);
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  ElektroPolis Shopify → Supabase Migration");
  console.log("═══════════════════════════════════════════════\n");

  // Step 1: Fetch data from Shopify
  const [products, collections] = await Promise.all([
    fetchAllProducts(),
    fetchAllCollections(),
  ]);

  // Step 2: Migrate brands
  const brandMap = await migrateBrands(products);

  // Step 3: Migrate collections
  const collectionMap = await migrateCollections(collections);

  // Step 4: Migrate products (with images)
  const productMap = await migrateProducts(products, brandMap);

  // Step 5: Map products to collections
  await migrateCollectionMappings(
    collections,
    collectionMap,
    productMap
  );

  // Step 6: Verify
  console.log("\n═══════════════════════════════════════════════");
  console.log("  Migration Complete! Verifying...");
  console.log("═══════════════════════════════════════════════\n");

  const { count: brandCount } = await supabase
    .from("brands")
    .select("*", { count: "exact", head: true });
  const { count: collectionCount } = await supabase
    .from("collections")
    .select("*", { count: "exact", head: true });
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  const { count: imageCount } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true });

  console.log(`  Brands:      ${brandCount}`);
  console.log(`  Collections: ${collectionCount}`);
  console.log(`  Products:    ${productCount}`);
  console.log(`  Images:      ${imageCount}`);
  console.log("\n  Done!\n");
}

main().catch(console.error);
