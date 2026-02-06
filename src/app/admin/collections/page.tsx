import Link from "next/link";
import Image from "next/image";
import { FolderOpen, ExternalLink, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const supabase = await createClient();

  // Fetch collections with product counts
  const { data: collections, error } = await supabase
    .from("collections")
    .select("id, title, handle, description, image_url, is_visible, sort_order")
    .order("sort_order", { ascending: true });

  // Fetch product counts per collection if there's a junction table, or approximate from products
  // For now, we display collections without counts (can be enhanced with a many-to-many query)
  let collectionProductCounts: Record<string, number> = {};

  if (collections && collections.length > 0) {
    // Get counts from the product_collections junction table
    const { data: counts } = await supabase
      .from("product_collections")
      .select("collection_id")
      .in(
        "collection_id",
        collections.map((c) => c.id)
      );

    if (counts) {
      collectionProductCounts = counts.reduce(
        (acc: Record<string, number>, row: { collection_id: string }) => {
          acc[row.collection_id] = (acc[row.collection_id] ?? 0) + 1;
          return acc;
        },
        {}
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Collections</h1>
        <p className="text-muted text-sm mt-1">
          Organize products into collections.
        </p>
      </div>

      {/* Collections */}
      {error ? (
        <div className="bg-white rounded-xl border border-border px-6 py-12 text-center text-red-600">
          Failed to load collections: {error.message}
        </div>
      ) : !collections || collections.length === 0 ? (
        <div className="bg-white rounded-xl border border-border px-6 py-12 text-center">
          <FolderOpen className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No collections found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => {
            const productCount = collectionProductCounts[collection.id] ?? 0;
            return (
              <div
                key={collection.id}
                className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Image */}
                <div className="aspect-[16/9] relative bg-surface">
                  {collection.image_url ? (
                    <Image
                      src={collection.image_url}
                      alt={collection.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FolderOpen className="w-10 h-10 text-muted" />
                    </div>
                  )}
                  {/* Visibility badge */}
                  <div
                    className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      collection.is_visible
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {collection.is_visible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                    {collection.is_visible ? "Visible" : "Hidden"}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-charcoal">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-muted line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted">
                      {productCount} {productCount === 1 ? "product" : "products"}
                    </span>
                    <Link
                      href={`/collections/${collection.handle}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-brand hover:text-brand-hover font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
