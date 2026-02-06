import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

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
      "id, title, vendor, price, inventory_count, status, created_at, product_images(url, alt_text, is_primary)"
    )
    .order("created_at", { ascending: false });

  if (query) {
    productsQuery = productsQuery.ilike("title", `%${query}%`);
  }

  if (statusFilter && statusFilter !== "all") {
    productsQuery = productsQuery.eq("status", statusFilter);
  }

  const { data: products, error } = await productsQuery.limit(100);

  const getPrimaryImage = (
    images: { url: string; alt_text: string | null; is_primary: boolean }[]
  ) => {
    if (!images || images.length === 0) return null;
    const primary = images.find((i) => i.is_primary);
    return primary ?? images[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Products</h1>
          <p className="text-muted text-sm mt-1">
            Manage your product catalog.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>
          <select
            name="status"
            defaultValue={statusFilter}
            className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-charcoal/90 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {error ? (
          <div className="px-6 py-12 text-center text-red-600">
            Failed to load products: {error.message}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Package className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">No products found.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 mt-4 text-brand hover:text-brand-hover text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left bg-surface/50">
                  <th className="px-6 py-3 font-medium text-muted w-16"></th>
                  <th className="px-6 py-3 font-medium text-muted">Title</th>
                  <th className="px-6 py-3 font-medium text-muted">
                    Vendor
                  </th>
                  <th className="px-6 py-3 font-medium text-muted text-right">
                    Price
                  </th>
                  <th className="px-6 py-3 font-medium text-muted text-right">
                    Stock
                  </th>
                  <th className="px-6 py-3 font-medium text-muted">Status</th>
                  <th className="px-6 py-3 font-medium text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => {
                  const img = getPrimaryImage(
                    product.product_images as {
                      url: string;
                      alt_text: string | null;
                      is_primary: boolean;
                    }[]
                  );
                  return (
                    <tr key={product.id} className="hover:bg-surface/30">
                      <td className="px-6 py-3">
                        <div className="w-10 h-10 rounded-lg border border-border overflow-hidden bg-surface flex items-center justify-center">
                          {img ? (
                            <Image
                              src={img.url}
                              alt={img.alt_text ?? product.title}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-muted" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium text-charcoal hover:text-brand"
                        >
                          {product.title}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-muted">
                        {product.vendor ?? "-"}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-charcoal">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <StockBadge count={product.inventory_count} />
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-brand hover:text-brand-hover text-sm font-medium"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
    archived: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] ?? "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StockBadge({ count }: { count: number }) {
  if (count <= 0)
    return (
      <span className="text-xs font-medium text-red-600">Out of stock</span>
    );
  if (count <= 5)
    return (
      <span className="text-xs font-medium text-orange-600">{count} left</span>
    );
  return <span className="text-xs text-muted">{count}</span>;
}
