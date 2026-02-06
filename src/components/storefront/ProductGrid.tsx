import ProductCard from "./ProductCard";

interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string | null;
  price: number;
  compare_at_price: number | null;
  inventory_count: number;
  images: { url: string; alt_text: string | null }[];
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-5 md:gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
