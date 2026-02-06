"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import slugify from "slugify";
import {
  ArrowLeft,
  Save,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [autoHandle, setAutoHandle] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

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

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      setMessage({
        type: "error",
        text: `Failed to create: ${error.message}`,
      });
      setSaving(false);
      return;
    }

    router.push(`/admin/products/${data.id}`);
  };

  const inputClasses =
    "w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand";

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
          <h1 className="text-2xl font-bold text-charcoal">New Product</h1>
        </div>
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
          Create Product
        </button>
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
              className={inputClasses}
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
                className={`flex-1 ${inputClasses} font-mono`}
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
              className={`${inputClasses} font-mono`}
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
              className={inputClasses}
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
              placeholder="e.g. Washing Machine"
              className={inputClasses}
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
              className={inputClasses}
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
              className={inputClasses}
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
              className={`${inputClasses} bg-white`}
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
              className={`${inputClasses} font-mono`}
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
              className={inputClasses}
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
              className={`${inputClasses} bg-white`}
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
            className={inputClasses}
          />
          <p className="text-xs text-muted mt-1">Separate tags with commas</p>
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
              className={inputClasses}
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
              className={inputClasses}
            />
            <p className="text-xs text-muted mt-1">
              {form.seo_description.length}/160 characters
            </p>
          </div>
        </div>
      </div>

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
          Create Product
        </button>
      </div>
    </div>
  );
}
