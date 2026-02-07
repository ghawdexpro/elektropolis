"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProductForm, {
  type ProductFormData,
  emptyFormData,
} from "@/components/admin/ProductForm";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  position: number;
}

export default function ProductEditPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", productId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setFormData({
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
        setLoading(false);
      });
  }, [productId]);

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
        <p className="text-lg font-medium text-charcoal">Product not found</p>
        <p className="mt-1 text-sm text-muted">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <ProductForm
      productId={productId}
      initialData={formData ?? emptyFormData}
      initialImages={images}
    />
  );
}
