import { Suspense } from "react";
import Card from "@/components/Card";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import FiltersToggle from "./FiltersToggle";
import { parseFilters } from "@/lib/utils/query";

// ---------------------------------------------------------------------------
// Mock product catalogue (mirrors DB shape; replace with real DB query later)
// ---------------------------------------------------------------------------

type ProductItem = {
  id: string;
  name: string;
  description: string;
  genderSlug: string;
  colorSlug: string;
  colorCount: number;
  sizes: string[];
  price: number;
  image: string;
  badge?: string;
};

const CATALOGUE: ProductItem[] = [
  {
    id: "1",
    name: "Nike Air Force 1 Mid '07",
    description: "Men's Shoes",
    genderSlug: "men",
    colorSlug: "white",
    colorCount: 4,
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
    price: 130,
    image: "/shoes/shoe-1.jpg",
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Nike Dunk Low Retro",
    description: "Men's Shoes",
    genderSlug: "men",
    colorSlug: "black",
    colorCount: 6,
    sizes: ["US 8", "US 9", "US 10", "US 11", "US 12"],
    price: 110,
    image: "/shoes/shoe-2.webp",
  },
  {
    id: "3",
    name: "Nike Air Max 90",
    description: "Women's Shoes",
    genderSlug: "women",
    colorSlug: "white",
    colorCount: 3,
    sizes: ["US 6", "US 7", "US 8", "US 9"],
    price: 130,
    image: "/shoes/shoe-3.webp",
    badge: "Best Seller",
  },
  {
    id: "4",
    name: "Nike Pegasus 41",
    description: "Men's Running Shoes",
    genderSlug: "men",
    colorSlug: "grey",
    colorCount: 5,
    sizes: ["US 8", "US 9", "US 10", "US 11"],
    price: 140,
    image: "/shoes/shoe-4.webp",
  },
  {
    id: "5",
    name: "Nike Blazer Mid '77",
    description: "Men's Shoes",
    genderSlug: "men",
    colorSlug: "white",
    colorCount: 2,
    sizes: ["US 7", "US 8", "US 9", "US 10"],
    price: 105,
    image: "/shoes/shoe-5.avif",
  },
  {
    id: "6",
    name: "Nike Air Max 270",
    description: "Women's Shoes",
    genderSlug: "women",
    colorSlug: "black",
    colorCount: 4,
    sizes: ["US 6", "US 7", "US 8"],
    price: 160,
    image: "/shoes/shoe-6.avif",
    badge: "Best Seller",
  },
  {
    id: "7",
    name: "Nike ZoomX Vaporfly NEXT%",
    description: "Road Racing Shoes",
    genderSlug: "unisex",
    colorSlug: "orange",
    colorCount: 2,
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
    price: 260,
    image: "/shoes/shoe-7.avif",
  },
  {
    id: "8",
    name: "Nike Air Jordan 1 Retro High OG",
    description: "Men's Shoes",
    genderSlug: "men",
    colorSlug: "red",
    colorCount: 8,
    sizes: ["US 8", "US 9", "US 10", "US 11", "US 12"],
    price: 180,
    image: "/shoes/shoe-8.avif",
  },
  {
    id: "9",
    name: "Nike Free RN 5.0",
    description: "Women's Running Shoes",
    genderSlug: "women",
    colorSlug: "pink",
    colorCount: 3,
    sizes: ["US 6", "US 6.5", "US 7", "US 8"],
    price: 100,
    image: "/shoes/shoe-9.avif",
    badge: "Extra 20% off",
  },
  {
    id: "10",
    name: "Nike React Infinity Run",
    description: "Women's Road Running Shoes",
    genderSlug: "women",
    colorSlug: "blue",
    colorCount: 4,
    sizes: ["US 6", "US 7", "US 8", "US 9"],
    price: 160,
    image: "/shoes/shoe-10.avif",
    badge: "Sustainable Materials",
  },
  {
    id: "11",
    name: "Nike SB Dunk High Pro",
    description: "Men's Skate Shoes",
    genderSlug: "men",
    colorSlug: "green",
    colorCount: 3,
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
    price: 115,
    image: "/shoes/shoe-11.avif",
  },
  {
    id: "12",
    name: "Nike Air Zoom Alphafly",
    description: "Road Racing Shoes",
    genderSlug: "unisex",
    colorSlug: "orange",
    colorCount: 2,
    sizes: ["US 7", "US 8", "US 9", "US 10"],
    price: 285,
    image: "/shoes/shoe-12.avif",
  },
  {
    id: "13",
    name: "Nike Killshot 2",
    description: "Unisex Shoes",
    genderSlug: "unisex",
    colorSlug: "white",
    colorCount: 2,
    sizes: ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11"],
    price: 80,
    image: "/shoes/shoe-13.avif",
    badge: "Extra 20% off",
  },
  {
    id: "14",
    name: "Nike Air Max Pulse",
    description: "Women's Shoes",
    genderSlug: "women",
    colorSlug: "grey",
    colorCount: 5,
    sizes: ["US 6", "US 7", "US 8", "US 9"],
    price: 145,
    image: "/shoes/shoe-14.avif",
  },
  {
    id: "15",
    name: "Nike Metcon 9",
    description: "Men's Training Shoes",
    genderSlug: "men",
    colorSlug: "black",
    colorCount: 4,
    sizes: ["US 8", "US 9", "US 10", "US 11", "US 12", "US 13"],
    price: 150,
    image: "/shoes/shoe-15.avif",
    badge: "Sustainable Materials",
  },
];

// ---------------------------------------------------------------------------
// Filtering + sorting helpers
// ---------------------------------------------------------------------------

function priceInRange(price: number, range: string): boolean {
  const [min, max] = range.split("-").map(Number);
  return price >= min && price <= max;
}

function applyFilters(
  products: ProductItem[],
  params: ReturnType<typeof parseFilters>
): ProductItem[] {
  let result = products;

  if (params.gender?.length) {
    result = result.filter((p) => params.gender!.includes(p.genderSlug));
  }
  if (params.color?.length) {
    result = result.filter((p) => params.color!.includes(p.colorSlug));
  }
  if (params.size?.length) {
    result = result.filter((p) =>
      params.size!.some((s) => p.sizes.includes(s))
    );
  }
  if (params.price?.length) {
    result = result.filter((p) =>
      params.price!.some((range) => priceInRange(p.price, range))
    );
  }

  return result;
}

function applySorting(
  products: ProductItem[],
  sort?: string
): ProductItem[] {
  const copy = [...products];
  if (sort === "price_asc") return copy.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") return copy.sort((a, b) => b.price - a.price);
  if (sort === "newest") return copy.reverse();
  return copy; // "featured" = original order
}

// ---------------------------------------------------------------------------
// Badge colour helper (shared with Card)
// ---------------------------------------------------------------------------

const BADGE_COLORS: Record<string, string> = {
  "Best Seller": "text-red",
  "Extra 20% off": "text-green",
  "Sustainable Materials": "text-green",
};

// ---------------------------------------------------------------------------
// Active filter pills row
// ---------------------------------------------------------------------------

type RawParams = Record<string, string | string[] | undefined>;

function ActiveFilterPills({ rawParams }: { rawParams: RawParams }) {
  const pills: { label: string; key: string; value: string }[] = [];

  const push = (key: string, val: string | string[] | undefined) => {
    if (!val) return;
    const arr = Array.isArray(val) ? val : [val];
    arr.forEach((v) => pills.push({ label: `${key}: ${v}`, key, value: v }));
  };

  push("gender", rawParams.gender);
  push("color", rawParams.color);
  push("size", rawParams.size);
  push("price", rawParams.price);

  if (!pills.length) return null;

  // Build remove-link helper
  const removeHref = (key: string, value: string) => {
    const next = { ...rawParams };
    const existing = next[key];
    if (Array.isArray(existing)) {
      const filtered = existing.filter((v) => v !== value);
      if (filtered.length) next[key] = filtered;
      else delete next[key];
    } else {
      delete next[key];
    }
    const qs = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (!v) return;
      const arr = Array.isArray(v) ? v : [v];
      arr.forEach((val) => qs.append(k, val));
    });
    const str = qs.toString();
    return str ? `/products?${str}` : "/products";
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {pills.map(({ label, key, value }) => (
        <a
          key={`${key}-${value}`}
          href={removeHref(key, value)}
          className="flex items-center gap-1.5 rounded-full border border-light-300 bg-light-200 px-3 py-1 text-caption text-dark-700 hover:border-dark-500 transition"
        >
          {label}
          <span aria-hidden className="text-dark-500">×</span>
        </a>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type SearchParamsType = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) {
  const rawParams = await searchParams;
  const filters = parseFilters(rawParams);
  const filtered = applyFilters(CATALOGUE, filters);
  const products = applySorting(filtered, filters.sort);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-jost">
      {/* Page heading */}
      <h1 className="text-heading-2 font-medium text-dark-900 mb-6">
        New &amp; Featured
      </h1>

      <div className="flex gap-8">
        {/* ---- Sidebar (desktop) ---- */}
        <div className="hidden lg:block w-56 shrink-0">
          <Suspense>
            <Filters />
          </Suspense>
        </div>

        {/* ---- Main content ---- */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <div className="lg:hidden">
                <Suspense>
                  <FiltersToggle />
                </Suspense>
              </div>
              <span className="text-body text-dark-700">
                {products.length} Result{products.length !== 1 ? "s" : ""}
              </span>
            </div>

            <Suspense>
              <Sort />
            </Suspense>
          </div>

          {/* Active filter pills */}
          <ActiveFilterPills rawParams={rawParams} />

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-heading-3 font-medium text-dark-900 mb-2">
                No results found
              </p>
              <p className="text-body text-dark-700 mb-6">
                Try adjusting or clearing your filters.
              </p>
              <a
                href="/products"
                className="rounded bg-dark-900 px-6 py-2.5 text-body-medium text-light-100 hover:bg-dark-700 transition"
              >
                Clear filters
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="relative">
                  {product.badge && (
                    <span
                      className={`absolute top-2 left-2 z-10 text-caption font-medium ${
                        BADGE_COLORS[product.badge] ?? "text-dark-700"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                  <Card
                    image={product.image}
                    title={product.name}
                    description={`${product.description} · ${product.colorCount} colour${product.colorCount !== 1 ? "s" : ""}`}
                    price={`$${product.price.toFixed(2)}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
