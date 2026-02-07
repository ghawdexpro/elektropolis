import Link from "next/link";
import Image from "next/image";
import {
  FolderOpen,
  ExternalLink,
  Plus,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Badge } from "@/components/admin/ui/Badge";

export const metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const supabase = await createClient();

  const { data: collections, error } = await supabase
    .from("collections")
    .select("id, title, handle, description, image_url, is_visible, sort_order")
    .order("sort_order", { ascending: true });

  let collectionProductCounts: Record<string, number> = {};

  if (collections && collections.length > 0) {
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
      <PageHeader
        title="Collections"
        subtitle={`${collections?.length ?? 0} collection${(collections?.length ?? 0) !== 1 ? "s" : ""}`}
        actions={
          <Link
            href="/admin/collections/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Collection
          </Link>
        }
      />

      {error ? (
        <div className="rounded-xl border border-border bg-white px-6 py-12 text-center text-red-600">
          Failed to load collections: {error.message}
        </div>
      ) : !collections || collections.length === 0 ? (
        <div className="rounded-xl border border-border bg-white">
          <EmptyState
            icon={FolderOpen}
            title="No collections yet"
            description="Create your first collection to organize products."
            action={{ label: "New Collection", href: "/admin/collections/new" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const productCount = collectionProductCounts[collection.id] ?? 0;
            return (
              <div
                key={collection.id}
                className="group overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-sm"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] bg-surface">
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
                      <FolderOpen className="h-10 w-10 text-muted" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <Badge
                      variant={collection.is_visible ? "visible" : "hidden"}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 p-4">
                  <h3 className="font-semibold text-charcoal">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="line-clamp-2 text-sm text-muted">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted">
                      {productCount}{" "}
                      {productCount === 1 ? "product" : "products"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/collections/${collection.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-charcoal hover:text-brand transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                      <Link
                        href={`/collections/${collection.handle}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Link>
                    </div>
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
