/**
 * Cleanup script: Delete all Ventura-tagged products and associated data
 * Usage: npx tsx scripts/cleanup-ventura.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("Cleaning up Ventura products...\n");

  // Get all ventura-tagged product IDs (paginate since there may be >1000)
  const allIds: string[] = [];
  let offset = 0;
  const pageSize = 500;

  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .contains("tags", ["ventura"])
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Error fetching products:", error.message);
      break;
    }
    if (!data || data.length === 0) break;
    allIds.push(...data.map((p) => p.id));
    offset += pageSize;
    if (data.length < pageSize) break;
  }

  console.log(`Found ${allIds.length} ventura-tagged products to delete`);

  if (allIds.length === 0) {
    console.log("Nothing to clean up.");
    return;
  }

  // Delete in batches of 100
  for (let i = 0; i < allIds.length; i += 100) {
    const batch = allIds.slice(i, i + 100);

    // Delete product_documents
    await supabase.from("product_documents").delete().in("product_id", batch);

    // Delete product_images
    await supabase.from("product_images").delete().in("product_id", batch);

    // Delete product_collections
    await supabase.from("product_collections").delete().in("product_id", batch);

    // Delete products
    const { error } = await supabase.from("products").delete().in("id", batch);
    if (error) {
      console.error(`Error deleting batch ${i}-${i + batch.length}:`, error.message);
    } else {
      console.log(`  Deleted batch ${i + 1}-${i + batch.length} of ${allIds.length}`);
    }
  }

  // Verify
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log(`\nDone. Total products remaining: ${count}`);
}

main().catch(console.error);
