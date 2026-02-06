"use client";

import { useRouter } from "next/navigation";

export default function SortDropdown({
  currentSort,
  basePath,
}: {
  currentSort?: string;
  basePath: string;
}) {
  const router = useRouter();
  const options = [
    { value: "", label: "Alphabetical" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
  ];

  return (
    <select
      name="sort"
      defaultValue={currentSort || ""}
      className="appearance-none bg-surface border border-border rounded-lg px-4 py-2.5 pr-10 text-[13px] font-medium text-charcoal cursor-pointer focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
      onChange={(e) => {
        const url = e.target.value
          ? `${basePath}?sort=${e.target.value}`
          : basePath;
        router.push(url);
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
