"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import slugify from "slugify";
import { Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormField, inputStyles, selectStyles } from "@/components/admin/ui/FormField";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useToast } from "@/components/admin/ui/Toast";
import { cn } from "@/lib/utils";

export default function NewCollectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [autoHandle, setAutoHandle] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoHandle) {
      setHandle(slugify(val, { lower: true, strict: true }));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ type: "error", message: "Title is required." });
      return;
    }

    setSaving(true);
    const slug = handle.trim() || slugify(title, { lower: true, strict: true });

    const { data, error } = await supabase
      .from("collections")
      .insert({
        title: title.trim(),
        handle: slug,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        is_visible: isVisible,
        sort_order: parseInt(sortOrder) || 0,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      toast({ type: "error", message: `Failed to create: ${error.message}` });
      setSaving(false);
      return;
    }

    toast({ type: "success", message: "Collection created." });
    router.push(`/admin/collections/${data.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New Collection"
        breadcrumbs={[
          { label: "Collections", href: "/admin/collections" },
          { label: "New Collection" },
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
            Create Collection
          </button>
        }
      />

      {/* Basic Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-base font-semibold text-charcoal">
          Basic Information
        </h2>
        <div className="space-y-5">
          <FormField label="Title" required>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Collection title"
              className={inputStyles}
            />
          </FormField>

          <FormField label="Handle (URL slug)">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={handle}
                onChange={(e) => {
                  setAutoHandle(false);
                  setHandle(e.target.value);
                }}
                placeholder="collection-handle"
                className={cn(inputStyles, "flex-1 font-mono")}
              />
              {!autoHandle && (
                <button
                  type="button"
                  onClick={() => {
                    setAutoHandle(true);
                    setHandle(slugify(title, { lower: true, strict: true }));
                  }}
                  className="shrink-0 rounded-lg border border-border px-3 py-2.5 text-xs text-muted hover:bg-surface transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </FormField>

          <FormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Collection description..."
              className={inputStyles}
            />
          </FormField>

          <FormField label="Image URL" help="Paste a URL or upload via Supabase Storage">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputStyles}
            />
          </FormField>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-base font-semibold text-charcoal">
          Settings
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

          <FormField label="Sort Order" help="Lower numbers appear first">
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min="0"
              className={inputStyles}
            />
          </FormField>
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-base font-semibold text-charcoal">SEO</h2>
        <div className="space-y-5">
          <FormField label="SEO Title" help={`${seoTitle.length}/70 characters`}>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Page title for search engines"
              maxLength={70}
              className={inputStyles}
            />
          </FormField>

          <FormField
            label="SEO Description"
            help={`${seoDescription.length}/160 characters`}
          >
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              placeholder="Meta description for search engines"
              maxLength={160}
              className={inputStyles}
            />
          </FormField>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Link
          href="/admin/collections"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-card transition-colors"
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
          Create Collection
        </button>
      </div>
    </div>
  );
}
