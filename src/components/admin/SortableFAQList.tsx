"use client";

import { useState } from "react";
import Link from "next/link";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/admin/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/ui/Toast";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  position: number;
  is_visible: boolean;
}

interface Props {
  initialFaqs: FAQ[];
  onDelete: (faq: FAQ) => void;
  onToggleVisibility: (faq: FAQ) => void;
}

function SortableRow({
  faq,
  onDelete,
  onToggleVisibility,
}: {
  faq: FAQ;
  onDelete: (faq: FAQ) => void;
  onToggleVisibility: (faq: FAQ) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start justify-between gap-4 px-5 py-4",
        isDragging && "bg-surface/50 shadow-sm z-10 relative rounded-lg"
      )}
    >
      <button
        className="mt-1 shrink-0 rounded p-0.5 text-muted/50 hover:text-muted cursor-grab active:cursor-grabbing transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-charcoal">{faq.question}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{faq.answer}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge
          variant={faq.is_visible ? "visible" : "hidden"}
          size="sm"
        />
        <button
          onClick={() => onToggleVisibility(faq)}
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-charcoal transition-colors"
          title={faq.is_visible ? "Hide" : "Show"}
        >
          {faq.is_visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
        <Link
          href={`/admin/faqs/${faq.id}`}
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-charcoal transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          onClick={() => onDelete(faq)}
          className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SortableCategoryGroup({
  category,
  faqs,
  onReorder,
  onDelete,
  onToggleVisibility,
}: {
  category: string;
  faqs: FAQ[];
  onReorder: (category: string, faqs: FAQ[]) => void;
  onDelete: (faq: FAQ) => void;
  onToggleVisibility: (faq: FAQ) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = faqs.findIndex((f) => f.id === active.id);
    const newIndex = faqs.findIndex((f) => f.id === over.id);

    const newOrder = [...faqs];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);

    onReorder(category, newOrder);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-surface/30 px-5 py-3">
        <h3 className="text-sm font-semibold text-charcoal">{category}</h3>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={faqs.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-border">
            {faqs.map((faq) => (
              <SortableRow
                key={faq.id}
                faq={faq}
                onDelete={onDelete}
                onToggleVisibility={onToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export function SortableFAQList({ initialFaqs, onDelete, onToggleVisibility }: Props) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const { toast } = useToast();
  const supabase = createClient();

  // Keep faqs in sync when parent updates (delete/toggle)
  // We rely on parent passing fresh initialFaqs; for drag we manage locally
  const grouped = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const handleReorder = async (category: string, newOrder: FAQ[]) => {
    // Update local state
    setFaqs((prev) => {
      const others = prev.filter((f) => f.category !== category);
      return [...others, ...newOrder].sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return 0;
      });
    });

    // Persist positions
    let hasError = false;
    for (let i = 0; i < newOrder.length; i++) {
      const { error } = await supabase
        .from("faqs")
        .update({ position: i })
        .eq("id", newOrder[i].id);
      if (error) {
        hasError = true;
        break;
      }
    }

    if (hasError) {
      toast({ type: "error", message: "Failed to save FAQ order." });
      setFaqs(initialFaqs);
    } else {
      toast({ type: "success", message: "FAQ order saved." });
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, categoryFaqs]) => (
        <SortableCategoryGroup
          key={category}
          category={category}
          faqs={categoryFaqs}
          onReorder={handleReorder}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
        />
      ))}
    </div>
  );
}
