"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormField, inputStyles, selectStyles } from "@/components/admin/ui/FormField";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useToast } from "@/components/admin/ui/Toast";

const DEFAULT_CATEGORIES = [
  "Delivery & Shipping",
  "Returns & Warranty",
  "Payment",
  "Products",
  "General",
];

export default function NewFAQPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [position, setPosition] = useState("0");
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!question.trim()) {
      toast({ type: "error", message: "Question is required." });
      return;
    }
    if (!answer.trim()) {
      toast({ type: "error", message: "Answer is required." });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("faqs")
      .insert({
        category: category.trim(),
        question: question.trim(),
        answer: answer.trim(),
        position: parseInt(position) || 0,
        is_visible: isVisible,
      })
      .select("id")
      .single();

    if (error) {
      toast({ type: "error", message: `Failed to create: ${error.message}` });
      setSaving(false);
      return;
    }

    toast({ type: "success", message: "FAQ created." });
    router.push(`/admin/faqs/${data.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New FAQ"
        breadcrumbs={[
          { label: "FAQs", href: "/admin/faqs" },
          { label: "New FAQ" },
        ]}
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Create FAQ
          </button>
        }
      />

      <div className="rounded-xl border border-border bg-white p-6">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Category" required>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectStyles}
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-5">
              <FormField label="Position" help="Lower = first">
                <input
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  min="0"
                  className={inputStyles}
                />
              </FormField>

              <FormField label="Visibility">
                <select
                  value={isVisible ? "visible" : "hidden"}
                  onChange={(e) => setIsVisible(e.target.value === "visible")}
                  className={selectStyles}
                >
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </FormField>
            </div>
          </div>

          <FormField label="Question" required>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is the return policy?"
              className={inputStyles}
            />
          </FormField>

          <FormField label="Answer" required>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="Write the answer here..."
              className={inputStyles}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pb-8">
        <Link
          href="/admin/faqs"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-white transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Create FAQ
        </button>
      </div>
    </div>
  );
}
