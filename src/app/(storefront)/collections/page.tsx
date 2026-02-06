import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "All Collections",
  description:
    "Browse all product categories at ElektroPolis Malta — kitchen sinks, cooker hoods, washing machines, refrigeration and more.",
};

export default async function CollectionsPage() {
  const supabase = await createClient();

  const { data: collections } = await supabase
    .from("collections")
    .select("id, title, handle, description, image_url")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  // Get product counts per collection
  const collectionsWithCounts = await Promise.all(
    (collections || []).map(async (col) => {
      const { count } = await supabase
        .from("product_collections")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", col.id);
      return { ...col, productCount: count || 0 };
    })
  );

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-[32px] md:text-[40px] font-bold text-charcoal tracking-tight mb-3">
          All Collections
        </h1>
        <p className="text-[15px] text-muted max-w-lg">
          Browse our full range of home appliances, kitchen fixtures, and more.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {collectionsWithCounts.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.handle}`}
            className="group relative bg-surface hover:bg-brand-light border border-border hover:border-brand/20 rounded-xl overflow-hidden transition-all duration-300"
          >
            {/* Image */}
            <div className="aspect-[16/10] relative bg-white">
              {col.image_url ? (
                <Image
                  src={col.image_url}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-surface">
                  <span className="text-[40px] font-bold text-border">
                    {col.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-charcoal group-hover:text-brand transition-colors">
                    {col.title}
                  </h2>
                  <p className="text-[13px] text-muted mt-0.5">
                    {col.productCount}{" "}
                    {col.productCount === 1 ? "product" : "products"}
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-300"
                  strokeWidth={2}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {collectionsWithCounts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[15px] text-muted">
            No collections available yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
