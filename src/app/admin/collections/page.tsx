import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { SortableCollectionList } from "@/components/admin/SortableCollectionList";

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
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-red-600">
          Failed to load collections: {error.message}
        </div>
      ) : !collections || collections.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={FolderOpen}
            title="No collections yet"
            description="Create your first collection to organize products."
            action={{ label: "New Collection", href: "/admin/collections/new" }}
          />
        </div>
      ) : (
        <SortableCollectionList
          collections={collections}
          productCounts={collectionProductCounts}
        />
      )}
    </div>
  );
}
