"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { setParam } from "@/lib/utils/query";

const SORT_OPTIONS = [
  { label: "Featured",        value: "featured" },
  { label: "Newest",          value: "newest" },
  { label: "Price: High–Low", value: "price_desc" },
  { label: "Price: Low–High", value: "price_asc" },
];

export default function Sort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "featured";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = setParam(searchParams.toString(), "sort", e.target.value);
    router.push(`/products?${next}`);
  };

  return (
    <div className="flex items-center gap-2 font-jost">
      <label
        htmlFor="sort-select"
        className="text-caption text-dark-700 whitespace-nowrap"
      >
        Sort By
      </label>
      <select
        id="sort-select"
        value={current}
        onChange={handleChange}
        className="rounded border border-light-400 bg-light-100 px-3 py-1.5 text-body text-dark-900
          focus:outline-none focus:ring-2 focus:ring-dark-900 transition cursor-pointer"
      >
        {SORT_OPTIONS.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
