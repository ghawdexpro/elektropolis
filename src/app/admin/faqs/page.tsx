"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, HelpCircle, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { SkeletonCard } from "@/components/admin/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Badge } from "@/components/admin/ui/Badge";
import { useToast } from "@/components/admin/ui/Toast";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  position: number;
  is_visible: boolean;
}

export default function FAQsPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = createClient();
    s.from("faqs")
      .select("*")
      .order("category")
      .order("position")
      .then(({ data }) => {
        setFaqs((data as FAQ[]) ?? []);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (faq: FAQ) => {
    const { error } = await supabase.from("faqs").delete().eq("id", faq.id);

    if (error) {
      toast({ type: "error", message: "Failed to delete FAQ." });
    } else {
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      toast({ type: "success", message: "FAQ deleted." });
    }
  };

  const handleToggleVisibility = async (faq: FAQ) => {
    const { error } = await supabase
      .from("faqs")
      .update({ is_visible: !faq.is_visible })
      .eq("id", faq.id);

    if (error) {
      toast({ type: "error", message: "Failed to update visibility." });
    } else {
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === faq.id ? { ...f, is_visible: !f.is_visible } : f
        )
      );
    }
  };

  // Group FAQs by category
  const grouped = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        subtitle={`${faqs.length} question${faqs.length !== 1 ? "s" : ""}`}
        actions={
          <Link
            href="/admin/faqs/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-4 animate-stagger">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={HelpCircle}
            title="No FAQs yet"
            description="Create your first FAQ to help customers."
            action={{ label: "Add FAQ", href: "/admin/faqs/new" }}
          />
        </div>
      ) : (
        Object.entries(grouped).map(([category, categoryFaqs]) => (
          <div
            key={category}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="border-b border-border bg-surface/30 px-5 py-3">
              <h3 className="text-sm font-semibold text-charcoal">
                {category}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {categoryFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-charcoal">
                      {faq.question}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={faq.is_visible ? "visible" : "hidden"}
                      size="sm"
                    />
                    <button
                      onClick={() => handleToggleVisibility(faq)}
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
                      onClick={() => handleDelete(faq)}
                      className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
