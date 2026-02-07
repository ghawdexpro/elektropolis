/**
 * Ventura Malta + Deante → ElektroPolis Import Script
 *
 * Reads scraped product data from the outlet-system's JSON and imports
 * into ElektroPolis's Supabase database (brands, collections, products, images, specs, docs).
 *
 * Usage: npx tsx scripts/import-ventura.ts           # Ventura only (630 products)
 *        npx tsx scripts/import-ventura.ts --all     # Ventura + Deante (3739 products)
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE env vars. Check .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Types ───────────────────────────────────────────────────────

interface RawProduct {
  name: string;
  price: string;
  priceNumeric: number;
  primaryImageUrl: string;
  images: { url: string; alt?: string; isPrimary: boolean }[];
  category: string;
  sku?: string;
  brand?: string;
  description?: string;
  shortDescription?: string;
  specifications?: { key: string; value: string; scope?: string }[];
  documents?: { url: string; title: string; type: string }[];
  productUrl?: string;
  scrapedAt: string;
  hasDetailedData: boolean;
  features?: { title: string; description: string; imageUrl: string }[];
  collection?: string;
  ean?: string;
  isInStock?: boolean;
  package?: {
    height: { value: number };
    width: { value: number };
    depth: { value: number };
    weight: { value: number };
  };
}

// ─── Category Detection (from outlet-system) ────────────────────

const CATEGORY_PATTERNS: Record<string, string[]> = {
  "washer-dryers": ["washer dryer", "wash dry", "wash/dry", "kg wash", "kg dry"],
  "dish-washers": ["dishwasher", "dish washer", "diswasher", "servings", "programmes", "programs", "programms", "place setting"],
  "washing-machines": ["washing machine", "front load", "top load", "twin tub", "spin dryer", "washer", "spin", "kilos", "kg"],
  "tumble-dryers": ["tumble dryer", "heat pump dryer", "condenser dryer", "dryer", "heat pump"],
  "freezers-fridges": ["fridge", "freezer", "refrigerator", "combi", "larder", "chest freezer", "upright freezer", "retro style", "side by side", "french door", "feeezer", "bottle cooler", "wine cooler", "ltr", "liter", "cooling box"],
  "brown-goods": ["tv", "television", "speaker", "audio", "alarm clock", "radio", "t.v", "android", "ultra hd", "4k", "smart tv", "qled", "oled"],
  "air-conditions": ["air condition", "split ac", "a/c", "btu", "inverter ac", "bracket", "mounting", "outdoor unit", "wifi module", "wi-fi module", "portable air conditioner", "anti-vibration"],
  "air-coolers": ["air cooler", "evaporative cooler", "portable cooler", "fan", "stand fan", "floor fan", "mist fan"],
  "water-heaters": ["water heater", "geyser", "boiler", "electric water", "heather", "water dispenser"],
  "heaters": ["heater", "radiator", "convector", "panel heater"],
  "freestanding-cookers": ["cooker 50cm", "cooker 60cm", "cooker 90cm", "gas cooker", "electric cooker", "freestanding", "range cooker", "gas oven 50cm", "gas oven 60cm"],
  "built-in-ovens": ["built-in oven", "built in oven", "build in oven", "electric oven", "gas oven", "multifunction", "function oven", "build-in", "warmer drawer", "warming drawer", "oven 6 function", "blomberg oven", "build in electric"],
  "built-in-electric-hobs": ["electric hob", "induction hob", "ceramic hob", "induction", "ceramic", "glass hob"],
  "built-in-gas-hobs": ["gas hob", "gas burner", "burner hob", "burners", "enemel", "pan support", "wok support", "domino gas"],
  "microwave-ovens": ["microwave", "mini oven"],
  "cooker-hoods": ["cooker hood", "hood", "extractor", "island hood", "chimney", "pyramid", "curved glass", "t-shape", "box t-shape"],
  "kitchen-sinks": ["sink", "bowl sink", "drain", "granitek"],
  "taps": ["tap", "faucet", "mixer", "spout"],
  "small-appliances": ["kettle", "toaster", "blender", "iron", "vacuum", "juicer", "sandwich maker", "hair dryer", "trimmer", "air fryer", "coffee", "espresso", "grill"],
};

const CATEGORY_DISPLAY: Record<string, string> = {
  "washer-dryers": "Washer Dryers",
  "dish-washers": "Dishwashers",
  "washing-machines": "Washing Machines",
  "tumble-dryers": "Tumble Dryers",
  "freezers-fridges": "Fridge Freezers",
  "brown-goods": "Brown Goods",
  "air-conditions": "Air Conditioners",
  "air-coolers": "Air Coolers",
  "water-heaters": "Water Heaters",
  "heaters": "Heaters",
  "freestanding-cookers": "Freestanding Cookers",
  "built-in-ovens": "Built-in Ovens",
  "built-in-electric-hobs": "Electric Hobs",
  "built-in-gas-hobs": "Gas Hobs",
  "microwave-ovens": "Microwave Ovens",
  "cooker-hoods": "Cooker Hoods",
  "kitchen-sinks": "Kitchen Sinks",
  "taps": "Taps & Mixers",
  "small-appliances": "Small Appliances",
  "bathroom-fixtures": "Bathroom Fixtures",
  "accessories": "Accessories",
};

// Map detected category → ElektroPolis collection handle
const CATEGORY_TO_COLLECTION: Record<string, string> = {
  "freezers-fridges": "freestanding-fridge-freezers",
  "washing-machines": "freestanding-washing-machines",
  "washer-dryers": "freestanding-washer-dryers",
  "kitchen-sinks": "kitchen-sinks",
  "taps": "sink-mixers",
  "cooker-hoods": "chimney-cooker-hoods",
  "air-coolers": "air-treatment",
  "tumble-dryers": "tumble-dryers",
  "dish-washers": "dishwashers",
  "air-conditions": "air-conditions",
  "heaters": "heaters",
  "water-heaters": "water-heaters",
  "built-in-ovens": "built-in-ovens",
  "freestanding-cookers": "freestanding-cookers",
  "built-in-gas-hobs": "gas-hobs",
  "built-in-electric-hobs": "electric-hobs",
  "microwave-ovens": "microwave-ovens",
  "small-appliances": "small-appliances",
  "brown-goods": "brown-goods",
  "bathroom-fixtures": "bathroom-fixtures",
  "accessories": "accessories",
};

// New collections to create (handle → title)
const NEW_COLLECTIONS: Record<string, string> = {
  "tumble-dryers": "Tumble Dryers",
  "dishwashers": "Dishwashers",
  "air-conditions": "Air Conditioners",
  "heaters": "Heaters",
  "water-heaters": "Water Heaters",
  "built-in-ovens": "Built-in Ovens",
  "freestanding-cookers": "Freestanding Cookers",
  "gas-hobs": "Gas Hobs",
  "electric-hobs": "Electric Hobs",
  "microwave-ovens": "Microwave Ovens",
  "small-appliances": "Small Appliances",
  "brown-goods": "Brown Goods",
  "bathroom-fixtures": "Bathroom Fixtures",
  "accessories": "Accessories",
};

function categorizeProduct(name: string, existingCategory?: string): { slug: string; display: string } {
  // If already categorized with a known category (e.g. Deante products), use it
  if (existingCategory && existingCategory !== "All" && CATEGORY_DISPLAY[existingCategory]) {
    return { slug: existingCategory, display: CATEGORY_DISPLAY[existingCategory] };
  }

  const nameLower = name.toLowerCase();
  for (const [slug, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (nameLower.includes(pattern)) {
        return { slug, display: CATEGORY_DISPLAY[slug] || slug };
      }
    }
  }
  return { slug: "small-appliances", display: "Small Appliances" };
}

// ─── Brand Extraction (from outlet-system) ──────────────────────

const KNOWN_BRANDS = [
  "Midea", "Ferre", "Xper", "Richome", "Granitek", "RealStone", "Simfer",
  "Deante", "Elica", "Foster", "Beko", "Indesit", "Whirlpool", "Zanussi",
  "Samsung", "LG", "Smeg", "Bosch", "Siemens", "AEG", "Electrolux",
  "Candy", "Hoover", "Haier", "Gree", "Daikin", "Mitsubishi", "Fujitsu",
  "Panasonic", "Sony", "Philips", "Braun", "Kenwood", "Delonghi",
  "Nespresso", "Krups", "Tefal", "Moulinex", "Rowenta",
  "Remington", "Babyliss", "Dyson", "Shark", "Ninja",
  "Sencor", "Smarton", "AVG", "General", "Edesa", "Severin", "Princess",
  "Tristar", "Ariete", "Gaggia", "Saeco",
  "Grundig", "Daewoo", "Hyundai", "Westpoint", "Atlantic", "Blomberg", "Konka",
  "Deton",
].map((b) => b.toLowerCase());

function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractBrand(raw: RawProduct): string {
  // Strategy 0: Use existing brand if available
  if (raw.brand && raw.brand.trim().length > 1) {
    return toTitleCase(raw.brand.trim());
  }

  // Strategy 1: Regex extract from description
  if (raw.description) {
    const brandMatch =
      raw.description.match(/Brand[ \t]*:[ \t]*([^\n\r<]+)/i) ||
      raw.description.match(/^Brand[ \t]+([^\n\r<]+)/mi);

    if (brandMatch) {
      let candidate = brandMatch[1].trim();
      const splitTerms = ["Style", "Color", "Colour", "Size", "Detail", "Material", "Voltage", "Wattage"];
      for (const term of splitTerms) {
        const idx = candidate.toLowerCase().indexOf(term.toLowerCase());
        if (idx !== -1) {
          candidate = candidate.substring(0, idx).trim();
        }
      }
      const cleanCandidate = candidate.replace(/[^a-zA-Z0-9\s\-]/g, "").trim();
      if (cleanCandidate.length > 1 && cleanCandidate.length < 30 && !["the", "and", "for", "with"].includes(cleanCandidate.toLowerCase())) {
        return toTitleCase(cleanCandidate);
      }
    }
  }

  // Strategy 2: Check specifications
  if (raw.specifications) {
    const brandSpec = raw.specifications.find(
      (s) => s.key.toLowerCase().includes("brand") || s.key.toLowerCase().includes("manufacturer")
    );
    if (brandSpec && brandSpec.value.trim().length > 1) {
      return toTitleCase(brandSpec.value.trim());
    }
  }

  // Strategy 3: Name starts with known brand
  const lowerName = raw.name.toLowerCase();
  const foundBrand = KNOWN_BRANDS.find((b) => lowerName.startsWith(b));
  if (foundBrand) {
    return toTitleCase(foundBrand);
  }

  // Strategy 4: First word heuristic
  const firstWord = raw.name.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
  if (firstWord.length > 2 && KNOWN_BRANDS.includes(firstWord.toLowerCase())) {
    return toTitleCase(firstWord);
  }

  return "Ventura";
}

// ─── Slug Generation ────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 200);
}

function generateUniqueHandle(
  name: string,
  sku: string | undefined,
  existingHandles: Set<string>
): string {
  let base = slugify(name);
  if (!base) base = "product";

  if (!existingHandles.has(base)) {
    existingHandles.add(base);
    return base;
  }

  // Try with SKU
  if (sku && sku.length > 2) {
    const skuHandle = slugify(`${name} ${sku}`);
    if (skuHandle && !existingHandles.has(skuHandle)) {
      existingHandles.add(skuHandle);
      return skuHandle;
    }
  }

  // Numeric suffix
  let counter = 2;
  while (existingHandles.has(`${base}-${counter}`)) {
    counter++;
  }
  const finalHandle = `${base}-${counter}`;
  existingHandles.add(finalHandle);
  return finalHandle;
}

// ─── Import Functions ───────────────────────────────────────────

async function importBrands(products: RawProduct[]): Promise<Map<string, string>> {
  const brandNames = new Set<string>();
  for (const p of products) {
    brandNames.add(extractBrand(p));
  }

  const brandMap = new Map<string, string>();
  console.log(`\nUpserting ${brandNames.size} brands...`);

  for (const name of brandNames) {
    const brandSlug = slugify(name);
    const { data, error } = await supabase
      .from("brands")
      .upsert({ name, slug: brandSlug }, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) {
      console.error(`  ✗ Brand "${name}":`, error.message);
      continue;
    }
    brandMap.set(name, data.id);
    console.log(`  ✓ Brand: ${name}`);
  }

  return brandMap;
}

async function importCollections(): Promise<Map<string, string>> {
  const collectionMap = new Map<string, string>();

  // First, fetch existing collections
  const { data: existing } = await supabase
    .from("collections")
    .select("id, handle");

  if (existing) {
    for (const col of existing) {
      collectionMap.set(col.handle, col.id);
    }
  }
  console.log(`\nFound ${collectionMap.size} existing collections`);

  // Create new collections
  console.log(`Creating ${Object.keys(NEW_COLLECTIONS).length} new collections...`);
  for (const [handle, title] of Object.entries(NEW_COLLECTIONS)) {
    if (collectionMap.has(handle)) {
      console.log(`  ○ Collection "${title}" already exists`);
      continue;
    }

    const { data, error } = await supabase
      .from("collections")
      .upsert(
        { title, handle, is_visible: true, sort_order: 0 },
        { onConflict: "handle" }
      )
      .select("id")
      .single();

    if (error) {
      console.error(`  ✗ Collection "${title}":`, error.message);
      continue;
    }
    collectionMap.set(handle, data.id);
    console.log(`  ✓ Collection: ${title} (${handle})`);
  }

  return collectionMap;
}

async function fetchExistingHandles(): Promise<Set<string>> {
  const handles = new Set<string>();
  const { data } = await supabase.from("products").select("handle");
  if (data) {
    for (const p of data) {
      handles.add(p.handle);
    }
  }
  console.log(`\nFound ${handles.size} existing product handles`);
  return handles;
}

function isGenericDescription(desc: string | undefined): boolean {
  if (!desc) return true;
  const lower = desc.toLowerCase();
  return (
    lower.includes("oneavant ecommerce") ||
    lower.includes("your one-stop shop") ||
    desc.trim().length < 20 ||
    lower === "no description available for this product variant."
  );
}

async function importProducts(
  products: RawProduct[],
  brandMap: Map<string, string>,
  collectionMap: Map<string, string>,
  existingHandles: Set<string>
) {
  let imported = 0;
  let imageCount = 0;
  let collectionLinks = 0;
  let docCount = 0;
  let specCount = 0;
  let errors = 0;

  console.log(`\nImporting ${products.length} products...`);

  for (let i = 0; i < products.length; i++) {
    const raw = products[i];

    try {
      const brand = extractBrand(raw);
      const brandId = brandMap.get(brand) || null;
      const { slug: categorySlug, display: categoryDisplay } = categorizeProduct(raw.name, raw.category);
      const collectionHandle = CATEGORY_TO_COLLECTION[categorySlug] || "small-appliances";
      const collectionId = collectionMap.get(collectionHandle);

      const handle = generateUniqueHandle(raw.name, raw.sku, existingHandles);
      const description = isGenericDescription(raw.description) ? null : raw.description;
      const seoDesc =
        raw.shortDescription && !isGenericDescription(raw.shortDescription)
          ? raw.shortDescription.substring(0, 160)
          : null;

      const tags = ["ventura", categorySlug];
      if (brand !== "Ventura") tags.push(slugify(brand));

      // Clean specifications
      const specs =
        raw.specifications && raw.specifications.length > 0
          ? raw.specifications.map((s) => ({ key: s.key, value: s.value }))
          : [];

      // Upsert product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .upsert(
          {
            title: raw.name,
            handle,
            body_html: description,
            vendor: brand,
            brand_id: brandId,
            product_type: categoryDisplay,
            status: "active",
            tags,
            price: raw.priceNumeric,
            compare_at_price: null,
            currency: "EUR",
            sku: raw.sku || null,
            barcode: raw.ean || null,
            inventory_count: raw.isInStock === false ? 0 : 10,
            weight_grams: raw.package?.weight?.value
              ? Math.round(raw.package.weight.value * 1000)
              : 0,
            requires_shipping: true,
            seo_description: seoDesc,
            specifications: specs,
          },
          { onConflict: "handle" }
        )
        .select("id")
        .single();

      if (productError) {
        console.error(`  ✗ [${i + 1}] "${raw.name}":`, productError.message);
        errors++;
        continue;
      }

      const productId = productData.id;

      // Insert images (deduplicated)
      const seenUrls = new Set<string>();
      const uniqueImages = (raw.images || []).filter((img) => {
        if (!img.url || seenUrls.has(img.url)) return false;
        seenUrls.add(img.url);
        return true;
      });

      // If no images from array, use primaryImageUrl
      if (uniqueImages.length === 0 && raw.primaryImageUrl) {
        uniqueImages.push({ url: raw.primaryImageUrl, isPrimary: true });
      }

      for (let j = 0; j < uniqueImages.length; j++) {
        const { error: imgError } = await supabase.from("product_images").insert({
          product_id: productId,
          url: uniqueImages[j].url,
          alt_text: raw.name,
          position: j + 1,
          is_primary: j === 0,
        });
        if (!imgError) imageCount++;
      }

      // Link to collection
      if (collectionId) {
        const { error: linkError } = await supabase
          .from("product_collections")
          .upsert(
            { product_id: productId, collection_id: collectionId, position: 0 },
            { onConflict: "product_id,collection_id" }
          );
        if (!linkError) collectionLinks++;
      }

      // Insert documents (PDFs, manuals, spec sheets)
      if (raw.documents && raw.documents.length > 0) {
        for (let k = 0; k < raw.documents.length; k++) {
          const doc = raw.documents[k];
          const docType = (["pdf", "manual", "spec", "other"].includes(doc.type) ? doc.type : "pdf") as string;
          const { error: docError } = await supabase.from("product_documents").insert({
            product_id: productId,
            url: doc.url,
            title: doc.title,
            type: docType,
            position: k + 1,
          });
          if (!docError) docCount++;
        }
      }

      if (specs.length > 0) specCount++;

      imported++;
      if ((i + 1) % 50 === 0 || i === products.length - 1) {
        console.log(`  Progress: ${i + 1}/${products.length} (${imported} imported, ${errors} errors)`);
      }
    } catch (err) {
      console.error(`  ✗ [${i + 1}] "${raw.name}": Exception:`, err);
      errors++;
    }
  }

  return { imported, imageCount, collectionLinks, docCount, specCount, errors };
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  const useAll = process.argv.includes("--all");

  console.log("═══════════════════════════════════════════════");
  console.log(useAll
    ? "  ElektroPolis: Full Product Import (Ventura + Deante)"
    : "  ElektroPolis: Ventura Malta Product Import"
  );
  console.log("═══════════════════════════════════════════════\n");

  // Load products JSON
  const jsonFile = useAll ? "ventura-products-all.json" : "ventura-products.json";
  const jsonPath = join(__dirname, jsonFile);
  console.log(`Reading products from ${jsonFile}...`);
  const rawData: RawProduct[] = JSON.parse(readFileSync(jsonPath, "utf-8"));
  console.log(`Loaded ${rawData.length} products`);

  // Step 1: Import brands
  const brandMap = await importBrands(rawData);

  // Step 2: Import collections
  const collectionMap = await importCollections();

  // Step 3: Get existing handles
  const existingHandles = await fetchExistingHandles();

  // Step 4: Import products with images and collection links
  const result = await importProducts(rawData, brandMap, collectionMap, existingHandles);

  // Step 5: Verify
  console.log("\n═══════════════════════════════════════════════");
  console.log("  Import Complete! Summary:");
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
  const { count: imgCount } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true });

  const { count: docTotal } = await supabase
    .from("product_documents")
    .select("*", { count: "exact", head: true });

  console.log(`  Products imported: ${result.imported}`);
  console.log(`  Images inserted:   ${result.imageCount}`);
  console.log(`  Collection links:  ${result.collectionLinks}`);
  console.log(`  Specs added:       ${result.specCount} products`);
  console.log(`  Documents added:   ${result.docCount}`);
  console.log(`  Errors:            ${result.errors}`);
  console.log();
  console.log(`  Total brands:      ${brandCount}`);
  console.log(`  Total collections: ${collectionCount}`);
  console.log(`  Total products:    ${productCount}`);
  console.log(`  Total images:      ${imgCount}`);
  console.log(`  Total documents:   ${docTotal}`);
  console.log("\n  Done!\n");
}

main().catch(console.error);
