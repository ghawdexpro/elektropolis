"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import slugify from "slugify";
import { Save, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormField, inputStyles, selectStyles } from "@/components/admin/ui/FormField";
import { ImageUpload } from "@/components/admin/ui/ImageUpload";
import { Modal, ModalCancelButton, ModalConfirmButton } from "@/components/admin/ui/Modal";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useToast } from "@/components/admin/ui/Toast";
import { cn } from "@/lib/utils";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  position: number;
}

export interface ProductFormData {
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  price: string;
  compare_at_price: string;
  sku: string;
  inventory_count: string;
  tags: string;
  status: string;
  currency: string;
  seo_title: string;
  seo_description: string;
}

export const emptyFormData: ProductFormData = {
  title: "",
  handle: "",
  body_html: "",
  vendor: "",
  product_type: "",
  price: "",
  compare_at_price: "",
  sku: "",
  inventory_count: "0",
  tags: "",
  status: "draft",
  currency: "EUR",
  seo_title: "",
  seo_description: "",
};

interface ProductFormProps {
  productId?: string;
  initialData?: ProductFormData;
  initialImages?: ProductImage[];
}

export default function ProductForm({
  productId,
  initialData,
  initialImages = [],
}: ProductFormProps) {
  const isNew = !productId;
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [form, setForm] = useState<ProductFormData>(initialData ?? emptyFormData);
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoHandle, setAutoHandle] = useState(isNew);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      handle: autoHandle
        ? slugify(title, { lower: true, strict: true })
        : prev.handle,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "title") {
      handleTitleChange(value);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);

    if (!form.title.trim()) {
      toast({ type: "error", message: "Title is required." });
      setSaving(false);
      return;
    }

    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
      toast({ type: "error", message: "Please enter a valid price." });
      setSaving(false);
      return;
    }

    const handle =
      form.handle.trim() || slugify(form.title, { lower: true, strict: true });

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      handle,
      body_html: form.body_html,
      vendor: form.vendor.trim() || null,
      product_type: form.product_type.trim() || null,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price
        ? parseFloat(form.compare_at_price)
        : null,
      sku: form.sku.trim() || null,
      inventory_count: parseInt(form.inventory_count) || 0,
      tags: tagsArray.length > 0 ? tagsArray : null,
      status: form.status,
      currency: form.currency,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
    };

    if (isNew) {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        toast({ type: "error", message: `Failed to create: ${error.message}` });
        setSaving(false);
        return;
      }

      toast({ type: "success", message: "Product created." });
      router.push(`/admin/products/${data.id}`);
    } else {
      const { error } = await supabase
        .from("products")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", productId);

      if (error) {
        toast({ type: "error", message: `Failed to save: ${error.message}` });
      } else {
        toast({ type: "success", message: "Product saved." });
      }
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId!);

    if (error) {
      toast({ type: "error", message: `Failed to delete: ${error.message}` });
      setDeleting(false);
      setShowDeleteModal(false);
    } else {
      toast({ type: "success", message: "Product deleted." });
      router.push("/admin/products");
    }
  };

  const handleUpload = useCallback(
    async (files: File[]) => {
      const pid = productId;
      if (!pid) {
        toast({ type: "error", message: "Save the product first before uploading images." });
        return;
      }

      setUploading(true);
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", pid);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.image) {
            setImages((prev) => [
              ...prev,
              {
                id: data.image.id,
                url: data.image.url,
                alt_text: data.image.alt_text,
                is_primary: data.image.is_primary,
                position: data.image.position,
              },
            ]);
          }
        } else {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          toast({ type: "error", message: err.error || "Upload failed" });
        }
      }
      setUploading(false);
      toast({ type: "success", message: `${files.length} image${files.length > 1 ? "s" : ""} uploaded.` });
    },
    [productId, toast]
  );

  const handleRemoveImage = useCallback(
    async (imageId: string) => {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (error) {
        toast({ type: "error", message: "Failed to remove image." });
      } else {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    },
    [supabase, toast]
  );

  const handleSetPrimary = useCallback(
    async (imageId: string) => {
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId!);

      const { error } = await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", imageId);

      if (!error) {
        setImages((prev) =>
          prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
        );
        toast({ type: "success", message: "Primary image updated." });
      }
    },
    [supabase, productId, toast]
  );

  const breadcrumbs = [
    { label: "Products", href: "/admin/products" },
    { label: isNew ? "New Product" : form.title || "Edit Product" },
  ];

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title={isNew ? "New Product" : "Edit Product"}
          subtitle={!isNew ? `ID: ${productId}` : undefined}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center gap-3">
              {!isNew && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
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
                {isNew ? "Create Product" : "Save Changes"}
              </button>
            </div>
          }
        />

        {/* Basic Information */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal mb-5">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Title" required className="md:col-span-2">
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Product title"
                className={inputStyles}
              />
            </FormField>

            <FormField label="Handle (URL slug)" className="md:col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="handle"
                  value={form.handle}
                  onChange={(e) => {
                    setAutoHandle(false);
                    handleChange(e);
                  }}
                  placeholder="product-handle"
                  className={cn(inputStyles, "flex-1 font-mono")}
                />
                {!autoHandle && (
                  <button
                    type="button"
                    onClick={() => {
                      setAutoHandle(true);
                      setForm((prev) => ({
                        ...prev,
                        handle: slugify(prev.title, { lower: true, strict: true }),
                      }));
                    }}
                    className="shrink-0 rounded-lg border border-border px-3 py-2.5 text-xs text-muted hover:bg-surface transition-colors"
                  >
                    Auto
                  </button>
                )}
              </div>
            </FormField>

            <FormField label="Description (HTML)" className="md:col-span-2">
              <textarea
                name="body_html"
                value={form.body_html}
                onChange={handleChange}
                rows={6}
                placeholder="Product description in HTML..."
                className={cn(inputStyles, "font-mono")}
              />
            </FormField>

            <FormField label="Vendor / Brand">
              <input
                type="text"
                name="vendor"
                value={form.vendor}
                onChange={handleChange}
                placeholder="e.g. Bosch, Samsung"
                className={inputStyles}
              />
            </FormField>

            <FormField label="Product Type">
              <input
                type="text"
                name="product_type"
                value={form.product_type}
                onChange={handleChange}
                placeholder="e.g. Washing Machine"
                className={inputStyles}
              />
            </FormField>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal mb-5">
            Images
          </h2>
          {isNew ? (
            <p className="text-sm text-muted py-6 text-center">
              Save the product first, then upload images.
            </p>
          ) : (
            <ImageUpload
              images={images}
              onUpload={handleUpload}
              onRemove={handleRemoveImage}
              onSetPrimary={handleSetPrimary}
              uploading={uploading}
            />
          )}
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal mb-5">
            Pricing
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField label="Price (EUR)" required>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={inputStyles}
              />
            </FormField>

            <FormField label="Compare at Price" help="Original price before discount">
              <input
                type="number"
                name="compare_at_price"
                value={form.compare_at_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={inputStyles}
              />
            </FormField>

            <FormField label="Currency">
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Inventory */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal mb-5">
            Inventory
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField label="SKU">
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="SKU-001"
                className={cn(inputStyles, "font-mono")}
              />
            </FormField>

            <FormField label="Inventory Count">
              <input
                type="number"
                name="inventory_count"
                value={form.inventory_count}
                onChange={handleChange}
                min="0"
                step="1"
                className={inputStyles}
              />
            </FormField>

            <FormField label="Status">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Organization */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal mb-5">
            Organization
          </h2>
          <FormField label="Tags" help="Separate tags with commas">
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="kitchen, appliance, sale"
              className={inputStyles}
            />
          </FormField>
        </div>

        {/* SEO */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal mb-5">SEO</h2>
          <div className="space-y-5">
            <FormField label="SEO Title" help={`${form.seo_title.length}/70 characters`}>
              <input
                type="text"
                name="seo_title"
                value={form.seo_title}
                onChange={handleChange}
                placeholder="Page title for search engines"
                maxLength={70}
                className={inputStyles}
              />
            </FormField>

            <FormField
              label="SEO Description"
              help={`${form.seo_description.length}/160 characters`}
            >
              <textarea
                name="seo_description"
                value={form.seo_description}
                onChange={handleChange}
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
            href="/admin/products"
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
            {isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        footer={
          <>
            <ModalCancelButton onClick={() => setShowDeleteModal(false)} />
            <ModalConfirmButton
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </ModalConfirmButton>
          </>
        }
      >
        <p className="text-sm text-muted">
          All associated images and data will be permanently removed.
        </p>
      </Modal>
    </>
  );
}
