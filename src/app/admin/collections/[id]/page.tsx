"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import slugify from "slugify";
import {
  Save,
  Loader2,
  Trash2,
  X,
  Plus,
  Search,
  Package,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormField, inputStyles, selectStyles } from "@/components/admin/ui/FormField";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Modal, ModalCancelButton, ModalConfirmButton } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";
import { cn } from "@/lib/utils";
import { SkeletonFormPage } from "@/components/admin/ui/Skeleton";

interface AssignedProduct {
  product_id: string;
  title: string;
  vendor: string | null;
  status: string;
}

export default function CollectionEditPage() {
  const params = useParams<{ id: string }>();
  const collectionId = params.id;
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [autoHandle, setAutoHandle] = useState(false);

  // Products
  const [assignedProducts, setAssignedProducts] = useState<AssignedProduct[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AssignedProduct[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const s = createClient();
    s.from("collections")
      .select("*")
      .eq("id", collectionId)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setTitle(data.title ?? "");
        setHandle(data.handle ?? "");
        setDescription(data.description ?? "");
        setImageUrl(data.image_url ?? "");
        setIsVisible(data.is_visible ?? true);
        setSortOrder(data.sort_order?.toString() ?? "0");
        setSeoTitle(data.seo_title ?? "");
        setSeoDescription(data.seo_description ?? "");

        // Load assigned products
        const { data: junctionData } = await s
          .from("product_collections")
          .select("product_id, products(title, vendor, status)")
          .eq("collection_id", collectionId)
          .order("position");

        const products: AssignedProduct[] = (junctionData ?? []).map((row) => {
          const p = row.products as unknown as { title: string; vendor: string | null; status: string };
          return {
            product_id: row.product_id,
            title: p?.title ?? "Unknown",
            vendor: p?.vendor ?? null,
            status: p?.status ?? "draft",
          };
        });
        setAssignedProducts(products);
        setLoading(false);
      });
  }, [collectionId]);

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

    const { error } = await supabase
      .from("collections")
      .update({
        title: title.trim(),
        handle: slug,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        is_visible: isVisible,
        sort_order: parseInt(sortOrder) || 0,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", collectionId);

    if (error) {
      toast({ type: "error", message: `Failed to save: ${error.message}` });
    } else {
      toast({ type: "success", message: "Collection saved." });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (error) {
      toast({ type: "error", message: `Failed to delete: ${error.message}` });
      setDeleting(false);
      setShowDeleteModal(false);
    } else {
      toast({ type: "success", message: "Collection deleted." });
      router.push("/admin/collections");
    }
  };

  const handleSearchProducts = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);

    const { data } = await supabase
      .from("products")
      .select("id, title, vendor, status")
      .ilike("title", `%${searchQuery}%`)
      .limit(10);

    const assignedIds = new Set(assignedProducts.map((p) => p.product_id));
    setSearchResults(
      (data ?? [])
        .filter((p) => !assignedIds.has(p.id))
        .map((p) => ({
          product_id: p.id,
          title: p.title,
          vendor: p.vendor,
          status: p.status,
        }))
    );
    setSearching(false);
  };

  const handleAddProduct = async (product: AssignedProduct) => {
    const position = assignedProducts.length;
    const { error } = await supabase.from("product_collections").insert({
      product_id: product.product_id,
      collection_id: collectionId,
      position,
    });

    if (error) {
      toast({ type: "error", message: `Failed to add product: ${error.message}` });
    } else {
      setAssignedProducts((prev) => [...prev, product]);
      setSearchResults((prev) =>
        prev.filter((p) => p.product_id !== product.product_id)
      );
      toast({ type: "success", message: `Added "${product.title}".` });
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    const { error } = await supabase
      .from("product_collections")
      .delete()
      .eq("product_id", productId)
      .eq("collection_id", collectionId);

    if (error) {
      toast({ type: "error", message: "Failed to remove product." });
    } else {
      setAssignedProducts((prev) =>
        prev.filter((p) => p.product_id !== productId)
      );
    }
  };

  if (loading) {
    return <SkeletonFormPage />;
  }

  if (notFound) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium text-charcoal">Collection not found</p>
        <Link
          href="/admin/collections"
          className="mt-2 inline-block text-sm text-brand hover:text-brand-hover"
        >
          Back to collections
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="Edit Collection"
          subtitle={title}
          breadcrumbs={[
            { label: "Collections", href: "/admin/collections" },
            { label: title || "Edit" },
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

        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-white p-6">
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

        {/* Products */}
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-charcoal">
              Products ({assignedProducts.length})
            </h2>
            <button
              onClick={() => setShowProductSearch(!showProductSearch)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-charcoal hover:bg-surface transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Products
            </button>
          </div>

          {/* Search bar */}
          {showProductSearch && (
            <div className="mb-4 space-y-3 rounded-lg border border-border bg-surface/50 p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchProducts();
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products to add..."
                    className="w-full rounded-lg border border-border bg-white py-2 pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90 transition-colors disabled:opacity-50"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="divide-y divide-border rounded-lg border border-border bg-white">
                  {searchResults.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex items-center justify-between px-4 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-charcoal">
                          {product.title}
                        </p>
                        {product.vendor && (
                          <p className="text-xs text-muted">{product.vendor}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddProduct(product)}
                        className="ml-3 shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assigned products list */}
          {assignedProducts.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="mx-auto mb-2 h-8 w-8 text-muted" />
              <p className="text-sm text-muted">
                No products in this collection yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border">
              {assignedProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-surface/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${product.product_id}`}
                      className="truncate text-sm font-medium text-charcoal hover:text-brand transition-colors"
                    >
                      {product.title}
                    </Link>
                    {product.vendor && (
                      <p className="text-xs text-muted">{product.vendor}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveProduct(product.product_id)}
                    className="ml-3 shrink-0 rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Remove from collection"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="rounded-xl border border-border bg-white p-6">
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
        <div className="rounded-xl border border-border bg-white p-6">
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

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Collection"
        description="Are you sure you want to delete this collection? Products will not be deleted."
        footer={
          <>
            <ModalCancelButton onClick={() => setShowDeleteModal(false)} />
            <ModalConfirmButton
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Collection"}
            </ModalConfirmButton>
          </>
        }
      >
        <p className="text-sm text-muted">
          Product assignments for this collection will be removed, but the products themselves will remain in the catalog.
        </p>
      </Modal>
    </>
  );
}
