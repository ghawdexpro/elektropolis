"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormField, inputStyles, selectStyles } from "@/components/admin/ui/FormField";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Modal, ModalCancelButton, ModalConfirmButton } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";

const DEFAULT_CATEGORIES = [
  "Delivery & Shipping",
  "Returns & Warranty",
  "Payment",
  "Products",
  "General",
];

export default function EditFAQPage() {
  const params = useParams<{ id: string }>();
  const faqId = params.id;
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [position, setPosition] = useState("0");
  const [isVisible, setIsVisible] = useState(true);

  const loadFAQ = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("id", faqId)
      .single();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setCategory(data.category ?? "");
    setQuestion(data.question ?? "");
    setAnswer(data.answer ?? "");
    setPosition(data.position?.toString() ?? "0");
    setIsVisible(data.is_visible ?? true);
    setLoading(false);
  }, [faqId, supabase]);

  useEffect(() => {
    loadFAQ();
  }, [loadFAQ]);

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
    const { error } = await supabase
      .from("faqs")
      .update({
        category: category.trim(),
        question: question.trim(),
        answer: answer.trim(),
        position: parseInt(position) || 0,
        is_visible: isVisible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", faqId);

    if (error) {
      toast({ type: "error", message: `Failed to save: ${error.message}` });
    } else {
      toast({ type: "success", message: "FAQ saved." });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("faqs").delete().eq("id", faqId);

    if (error) {
      toast({ type: "error", message: `Failed to delete: ${error.message}` });
      setDeleting(false);
      setShowDeleteModal(false);
    } else {
      toast({ type: "success", message: "FAQ deleted." });
      router.push("/admin/faqs");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium text-charcoal">FAQ not found</p>
        <Link
          href="/admin/faqs"
          className="mt-2 inline-block text-sm text-brand hover:text-brand-hover"
        >
          Back to FAQs
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="Edit FAQ"
          breadcrumbs={[
            { label: "FAQs", href: "/admin/faqs" },
            { label: "Edit" },
          ]}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
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
                Save Changes
              </button>
            </div>
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
                  {!DEFAULT_CATEGORIES.includes(category) && category && (
                    <option value={category}>{category}</option>
                  )}
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
            Save Changes
          </button>
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ?"
        footer={
          <>
            <ModalCancelButton onClick={() => setShowDeleteModal(false)} />
            <ModalConfirmButton
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete FAQ"}
            </ModalConfirmButton>
          </>
        }
      >
        <p className="text-sm text-muted">
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
