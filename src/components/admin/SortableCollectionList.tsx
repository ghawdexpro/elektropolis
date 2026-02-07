"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FolderOpen,
  ExternalLink,
  Pencil,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/admin/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/ui/Toast";

interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  image_url: string | null;
  is_visible: boolean;
  sort_order: number;
}

interface Props {
  collections: Collection[];
  productCounts: Record<string, number>;
}

function SortableCard({
  collection,
  productCount,
}: {
  collection: Collection;
  productCount: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group overflow-hidden rounded-xl border border-border bg-card transition-shadow",
        isDragging
          ? "shadow-lg shadow-black/10 ring-2 ring-brand/20 z-10 relative"
          : "hover:shadow-sm"
      )}
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
        {/* Drag handle */}
        <button
          className="absolute left-2 top-2 rounded-lg bg-black/40 p-1.5 text-white/70 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:text-white cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
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
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              productCount === 0
                ? "bg-red-50 text-red-600"
                : productCount <= 5
                  ? "bg-amber-50 text-amber-700"
                  : "bg-surface text-muted"
            )}
          >
            {productCount} {productCount === 1 ? "product" : "products"}
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
}

export function SortableCollectionList({
  collections: initialCollections,
  productCounts,
}: Props) {
  const [collections, setCollections] = useState(initialCollections);
  const { toast } = useToast();
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = collections.findIndex((c) => c.id === active.id);
    const newIndex = collections.findIndex((c) => c.id === over.id);

    const newOrder = [...collections];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);

    setCollections(newOrder);

    // Persist new sort_order values
    const updates = newOrder.map((c, i) => ({
      id: c.id,
      sort_order: i,
    }));

    let hasError = false;
    for (const update of updates) {
      const { error } = await supabase
        .from("collections")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id);
      if (error) {
        hasError = true;
        break;
      }
    }

    if (hasError) {
      toast({ type: "error", message: "Failed to save order." });
      setCollections(initialCollections);
    } else {
      toast({ type: "success", message: "Collection order saved." });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={collections.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <SortableCard
              key={collection.id}
              collection={collection}
              productCount={productCounts[collection.id] ?? 0}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
