"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import slugify from "slugify";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  position: number;
  is_primary: boolean;
}

interface ProductForm {
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

const emptyForm: ProductForm = {
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

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const isNew = productId === "new";

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [autoHandle, setAutoHandle] = useState(isNew);

  const supabase = createClient();

  const loadProduct = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", productId)
      .single();

    if (error || !data) {
      setMessage({ type: "error", text: "Product not found." });
      setLoading(false);
      return;
    }

    setForm({
      title: data.title ?? "",
      handle: data.handle ?? "",
      body_html: data.body_html ?? "",
      vendor: data.vendor ?? "",
      product_type: data.product_type ?? "",
      price: data.price?.toString() ?? "",
      compare_at_price: data.compare_at_price?.toString() ?? "",
      sku: data.sku ?? "",
      inventory_count: data.inventory_count?.toString() ?? "0",
      tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
      status: data.status ?? "draft",
      currency: data.currency ?? "EUR",
      seo_title: data.seo_title ?? "",
      seo_description: data.seo_description ?? "",
    });

    const imgs = (data.product_images ?? []) as ProductImage[];
    setImages(imgs.sort((a, b) => a.position - b.position));
    setAutoHandle(false);
    setLoading(false);
  }, [isNew, productId, supabase]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
    setMessage(null);

    // Validate required fields
    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Title is required." });
      setSaving(false);
      return;
    }

    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
      setMessage({ type: "error", text: "Please enter a valid price." });
      setSaving(false);
      return;
    }

    const handle =
      form.handle.trim() ||
      slugify(form.title, { lower: true, strict: true });

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
        setMessage({ type: "error", text: `Failed to create: ${error.message}` });
        setSaving(false);
        return;
      }

      setMessage({ type: "success", text: "Product created successfully." });
      setSaving(false);
      router.push(`/admin/products/${data.id}`);
    } else {
      const { error } = await supabase
        .from("products")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", productId);

      if (error) {
        setMessage({ type: "error", text: `Failed to update: ${error.message}` });
      } else {
        setMessage({ type: "success", text: "Product saved successfully." });
      }
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone."))
      return;

    setDeleting(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      setMessage({ type: "error", text: `Failed to delete: ${error.message}` });
      setDeleting(false);
    } else {
      router.push("/admin/products");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Delete this image?")) return;

    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      setMessage({ type: "error", text: `Failed to delete image: ${error.message}` });
    } else {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    // Unset all primary, then set the chosen one
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    const { error } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId);

    if (!error) {
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg hover:bg-white border border-border transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">
              {isNew ? "New Product" : "Edit Product"}
            </h1>
            {!isNew && (
              <p className="text-muted text-sm mt-0.5">ID: {productId}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-lg font-semibold text-charcoal">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Product title"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Handle (URL slug)
            </label>
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
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-mono"
              />
              {!autoHandle && (
                <button
                  type="button"
                  onClick={() => {
                    setAutoHandle(true);
                    setForm((prev) => ({
                      ...prev,
                      handle: slugify(prev.title, {
                        lower: true,
                        strict: true,
                      }),
                    }));
                  }}
                  className="px-3 py-2.5 text-xs border border-border rounded-lg hover:bg-surface transition-colors text-muted"
                >
                  Auto
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Description (HTML)
            </label>
            <textarea
              name="body_html"
              value={form.body_html}
              onChange={handleChange}
              rows={6}
              placeholder="Product description in HTML..."
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Vendor / Brand
            </label>
            <input
              type="text"
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
              placeholder="e.g. Bosch, Samsung"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Product Type
            </label>
            <input
              type="text"
              name="product_type"
              value={form.product_type}
              onChange={handleChange}
              placeholder="e.g. Washing Machine, Fridge"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-lg font-semibold text-charcoal">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Price (EUR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Compare at Price
            </label>
            <input
              type="number"
              name="compare_at_price"
              value={form.compare_at_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <p className="text-xs text-muted mt-1">
              Original price before discount
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Currency
            </label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-lg font-semibold text-charcoal">Inventory</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="SKU-001"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Inventory Count
            </label>
            <input
              type="number"
              name="inventory_count"
              value={form.inventory_count}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-lg font-semibold text-charcoal">Organization</h2>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="kitchen, appliance, sale (comma-separated)"
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
          <p className="text-xs text-muted mt-1">
            Separate tags with commas
          </p>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-lg font-semibold text-charcoal">SEO</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              SEO Title
            </label>
            <input
              type="text"
              name="seo_title"
              value={form.seo_title}
              onChange={handleChange}
              placeholder="Page title for search engines"
              maxLength={70}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <p className="text-xs text-muted mt-1">
              {form.seo_title.length}/70 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              SEO Description
            </label>
            <textarea
              name="seo_description"
              value={form.seo_description}
              onChange={handleChange}
              rows={3}
              placeholder="Meta description for search engines"
              maxLength={160}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <p className="text-xs text-muted mt-1">
              {form.seo_description.length}/160 characters
            </p>
          </div>
        </div>
      </div>

      {/* Images */}
      {!isNew && (
        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <h2 className="text-lg font-semibold text-charcoal">Images</h2>

          {images.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl py-12 text-center">
              <ImageIcon className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-muted text-sm">
                No images uploaded yet.
              </p>
              <p className="text-muted text-xs mt-1">
                Upload images via the Supabase dashboard or API.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`relative group rounded-xl border-2 overflow-hidden ${
                    img.is_primary
                      ? "border-brand"
                      : "border-border hover:border-muted"
                  }`}
                >
                  <div className="aspect-square relative bg-surface">
                    <Image
                      src={img.url}
                      alt={img.alt_text ?? "Product image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  {img.is_primary && (
                    <div className="absolute top-2 left-2 bg-brand text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Primary
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.is_primary && (
                      <button
                        onClick={() => handleSetPrimaryImage(img.id)}
                        className="p-2 bg-white rounded-lg text-charcoal hover:bg-brand hover:text-white transition-colors"
                        title="Set as primary"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom save */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Link
          href="/admin/products"
          className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-charcoal hover:bg-white transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isNew ? "Create Product" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
