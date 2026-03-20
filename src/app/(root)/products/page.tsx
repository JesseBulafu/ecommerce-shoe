import { Suspense } from "react";
import Card from "@/components/Card";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import FiltersToggle from "./FiltersToggle";
import { parseFilterParams } from "@/lib/utils/query";
import { getAllProducts } from "@/lib/actions/product";

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

  push("gender",   rawParams.gender);
  push("color",    rawParams.color);
  push("size",     rawParams.size);
  push("price",    rawParams.price);
  push("brand",    rawParams.brand);
  push("category", rawParams.category);

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
  const queryParams = parseFilterParams(rawParams);
  const { products, totalCount } = await getAllProducts(queryParams);

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
                {totalCount} Result{totalCount !== 1 ? "s" : ""}
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
                <Card
                  key={product.id}
                  image={product.image ?? "/shoes/shoe-1.jpg"}
                  title={product.name}
                  description={`${product.description} · ${product.colorCount} colour${product.colorCount !== 1 ? "s" : ""}`}
                  price={`$${Number(product.minPrice).toFixed(2)}`}
                  badge={product.badge ?? undefined}
                />
              ))}
            </div>
          )}

          {/* Pagination hint */}
          {totalCount > products.length && (
            <p className="mt-8 text-center text-caption text-dark-700">
              Showing {products.length} of {totalCount} products
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
