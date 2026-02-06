import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [], query: "" });
  }

  const supabase = await createClient();

  // Use PostgreSQL full-text search
  const tsQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  const { data: products, error } = await supabase
    .from("products")
    .select(
      `id, title, handle, vendor, price, compare_at_price, inventory_count,
       product_images (url, alt_text, position, is_primary)`
    )
    .eq("status", "active")
    .textSearch("search_vector", tsQuery)
    .limit(limit);

  if (error) {
    // Fallback to ILIKE search if full-text fails
    const { data: fallbackProducts } = await supabase
      .from("products")
      .select(
        `id, title, handle, vendor, price, compare_at_price, inventory_count,
         product_images (url, alt_text, position, is_primary)`
      )
      .eq("status", "active")
      .or(`title.ilike.%${query}%,vendor.ilike.%${query}%,product_type.ilike.%${query}%`)
      .limit(limit);

    const formatted = (fallbackProducts || []).map((p) => ({
      ...p,
      images: (p.product_images || [])
        .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
        .map((img: { url: string; alt_text: string | null }) => ({
          url: img.url,
          alt_text: img.alt_text,
        })),
    }));

    return NextResponse.json({ products: formatted, query });
  }

  const formatted = (products || []).map((p) => ({
    ...p,
    images: (p.product_images || [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((img: { url: string; alt_text: string | null }) => ({
        url: img.url,
        alt_text: img.alt_text,
      })),
  }));

  return NextResponse.json({ products: formatted, query });
}
