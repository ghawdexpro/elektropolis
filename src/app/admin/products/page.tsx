import Link from "next/link";
import { Plus, Search, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import AdminProductsTable from "@/components/admin/AdminProductsTable";
import type { AdminProduct } from "@/app/admin/actions";

const PER_PAGE = 50;

export const metadata = { title: "Products" };

export default async function AdminProductsPage(props: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q ?? "";
  const statusFilter = searchParams.status ?? "";

  const supabase = await createClient();

  let productsQuery = supabase
    .from("products")
    .select(
      "id, title, vendor, price, inventory_count, status, created_at, product_images(url, alt_text, is_primary)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (query) {
    productsQuery = productsQuery.ilike("title", `%${query}%`);
  }

  if (statusFilter && statusFilter !== "all") {
    productsQuery = productsQuery.eq("status", statusFilter);
  }

  productsQuery = productsQuery.range(0, PER_PAGE - 1);

  const { data: products, count, error } = await productsQuery;
  const totalCount = count || 0;

  const initialProducts: AdminProduct[] = (products || []).map((p) => {
    const images = (p.product_images as { url: string; alt_text: string | null; is_primary: boolean }[]) || [];
    const primary = images.find((i) => i.is_primary) ?? images[0] ?? null;
    return {
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      price: p.price,
      inventory_count: p.inventory_count,
      status: p.status,
      created_at: p.created_at,
      primaryImage: primary ? { url: primary.url, alt_text: primary.alt_text } : null,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${totalCount} product${totalCount !== 1 ? "s" : ""} in catalog`}
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        }
      />

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <form className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search products..."
              className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </div>
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-charcoal px-4 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Products table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {error ? (
          <div className="px-6 py-12 text-center text-red-600">
            Failed to load products: {error.message}
          </div>
        ) : !products || products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              query
                ? "Try adjusting your search or filters."
                : "Add your first product to get started."
            }
            action={
              !query
                ? { label: "Add Product", href: "/admin/products/new" }
                : undefined
            }
          />
        ) : (
          <AdminProductsTable
            key={`${query}-${statusFilter}`}
            initialProducts={initialProducts}
            totalCount={totalCount}
            q={query || undefined}
            status={statusFilter && statusFilter !== "all" ? statusFilter : undefined}
          />
        )}
      </div>
    </div>
  );
}
