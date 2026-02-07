"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, Plus } from "lucide-react";
import { SkeletonCard } from "@/components/admin/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { useToast } from "@/components/admin/ui/Toast";
import { SortableFAQList } from "@/components/admin/SortableFAQList";

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
        <SortableFAQList
          initialFaqs={faqs}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
        />
      )}
    </div>
  );
}
