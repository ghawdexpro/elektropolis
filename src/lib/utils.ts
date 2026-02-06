export function formatPrice(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-MT", {
    style: "currency",
    currency,
  }).format(amount);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getStockLabel(count: number): {
  label: string;
  color: string;
} {
  if (count <= 0) return { label: "Sold Out", color: "text-error" };
  if (count <= 3) return { label: "Very Low Stock", color: "text-error" };
  if (count <= 10) return { label: "Low Stock", color: "text-brand" };
  return { label: "In Stock", color: "text-success" };
}

export function truncateHtml(html: string, maxLength: number): string {
  const text = html.replace(/<[^>]*>/g, "");
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
