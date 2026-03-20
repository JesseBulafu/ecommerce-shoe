import qs from "query-string";

export type ParsedFilters = {
  gender?: string[];
  size?: string[];
  color?: string[];
  price?: string[];
  sort?: string;
  page?: string;
};

/**
 * Parse a raw search-params object (from Next.js page.tsx searchParams) into
 * a typed filters object. Always returns arrays for multi-value fields.
 */
export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>
): ParsedFilters {
  const toArray = (v: string | string[] | undefined): string[] | undefined => {
    if (!v) return undefined;
    const arr = Array.isArray(v) ? v : [v];
    return arr.length ? arr : undefined;
  };

  return {
    gender: toArray(searchParams.gender),
    size: toArray(searchParams.size),
    color: toArray(searchParams.color),
    price: toArray(searchParams.price),
    sort: typeof searchParams.sort === "string" ? searchParams.sort : undefined,
    page:
      typeof searchParams.page === "string" ? searchParams.page : undefined,
  };
}

/**
 * Serialize a filters object back to a query string.
 * Arrays with multiple values become repeated params (e.g. gender=men&gender=women).
 */
export function stringifyFilters(filters: ParsedFilters): string {
  return qs.stringify(filters, {
    skipNull: true,
    skipEmptyString: true,
    arrayFormat: "none",
    sort: false,
  });
}

/**
 * Add or update a single param value in an existing query string.
 * Resets page to 1 unless the key itself is "page".
 */
export function setParam(
  current: string,
  key: string,
  value: string
): string {
  const parsed = qs.parse(current, { arrayFormat: "none" });
  parsed[key] = value;
  if (key !== "page") delete parsed.page;
  return qs.stringify(parsed, {
    skipNull: true,
    skipEmptyString: true,
    arrayFormat: "none",
    sort: false,
  });
}

/**
 * Remove a single param entirely from an existing query string.
 * Resets page to 1.
 */
export function removeParam(current: string, key: string): string {
  const parsed = qs.parse(current, { arrayFormat: "none" });
  delete parsed[key];
  delete parsed.page;
  return qs.stringify(parsed, {
    skipNull: true,
    skipEmptyString: true,
    arrayFormat: "none",
    sort: false,
  });
}

/**
 * Toggle a value inside a multi-value param (e.g. gender: men ↔ men,women).
 * Resets page to 1.
 */
export function toggleArrayParam(
  current: string,
  key: string,
  value: string
): string {
  const parsed = qs.parse(current, { arrayFormat: "none" });
  const existing = parsed[key];
  const arr: string[] = existing
    ? Array.isArray(existing)
      ? (existing as string[])
      : [existing as string]
    : [];

  const next = arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];

  if (next.length === 0) {
    delete parsed[key];
  } else {
    parsed[key] = next;
  }
  delete parsed.page;

  return qs.stringify(parsed, {
    skipNull: true,
    skipEmptyString: true,
    arrayFormat: "none",
    sort: false,
  });
}

/**
 * Clear all filter params, keeping only sort & page.
 */
export function clearFilters(current: string): string {
  const parsed = qs.parse(current, { arrayFormat: "none" });
  const clean: Record<string, unknown> = {};
  if (parsed.sort) clean.sort = parsed.sort;
  return qs.stringify(clean, {
    skipNull: true,
    skipEmptyString: true,
    sort: false,
  });
}

/**
 * Check whether a value is currently active in a multi-value param.
 */
export function isParamActive(
  current: string,
  key: string,
  value: string
): boolean {
  const parsed = qs.parse(current, { arrayFormat: "none" });
  const existing = parsed[key];
  if (!existing) return false;
  const arr = Array.isArray(existing) ? existing : [existing];
  return arr.includes(value);
}

// ---------------------------------------------------------------------------
// Server-action param types & parsers
// ---------------------------------------------------------------------------

export type SortBy = "featured" | "newest" | "price_asc" | "price_desc";

/** Typed input for getAllProducts() / getProduct() server actions. */
export type ProductQueryParams = {
  search?: string;
  gender?: string[];
  color?: string[];
  size?: string[];
  brand?: string[];
  category?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: SortBy;
  page?: number;
  limit?: number;
};

/**
 * Maps raw Next.js `searchParams` (after `await searchParams`) to a fully
 * typed ProductQueryParams ready to pass to getAllProducts().
 *
 * Handles:
 * - Multi-value arrays (gender, color, size, brand, category)
 * - Legacy price-range strings ("50-150") → numeric priceMin / priceMax
 * - Explicit priceMin / priceMax overrides
 * - sortBy validation (only known values are forwarded)
 * - Safe coercion of page / limit integers
 */
export function parseFilterParams(
  searchParams: Record<string, string | string[] | undefined>
): ProductQueryParams {
  const toArray = (v: string | string[] | undefined): string[] | undefined => {
    if (!v) return undefined;
    const arr = Array.isArray(v) ? v : [v];
    return arr.length > 0 ? arr : undefined;
  };

  const toPositiveInt = (
    v: string | string[] | undefined,
    fallback: number
  ): number => {
    const raw = Array.isArray(v) ? v[0] : v;
    const n = parseInt(raw ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  // Convert legacy price-range strings ("0-50", "50-100") → overall min/max
  const priceRanges = toArray(searchParams.price);
  let priceMin: number | undefined;
  let priceMax: number | undefined;
  if (priceRanges?.length) {
    const mins: number[] = [];
    const maxes: number[] = [];
    for (const range of priceRanges) {
      const [lo, hi] = range.split("-").map(Number);
      if (Number.isFinite(lo)) mins.push(lo);
      if (Number.isFinite(hi)) maxes.push(hi);
    }
    if (mins.length) priceMin = Math.min(...mins);
    if (maxes.length) priceMax = Math.max(...maxes);
  }

  // Allow explicit ?priceMin=X / ?priceMax=X to override range strings
  const explicitMin = parseFloat(
    Array.isArray(searchParams.priceMin)
      ? searchParams.priceMin[0]
      : (searchParams.priceMin ?? "")
  );
  const explicitMax = parseFloat(
    Array.isArray(searchParams.priceMax)
      ? searchParams.priceMax[0]
      : (searchParams.priceMax ?? "")
  );
  if (Number.isFinite(explicitMin)) priceMin = explicitMin;
  if (Number.isFinite(explicitMax)) priceMax = explicitMax;

  const sortRaw =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const validSorts: SortBy[] = ["featured", "newest", "price_asc", "price_desc"];
  const sortBy = validSorts.includes(sortRaw as SortBy)
    ? (sortRaw as SortBy)
    : undefined;

  const rawSearch =
    typeof searchParams.search === "string"
      ? searchParams.search.trim()
      : undefined;

  return {
    search: rawSearch || undefined,
    gender: toArray(searchParams.gender),
    color: toArray(searchParams.color),
    size: toArray(searchParams.size),
    brand: toArray(searchParams.brand),
    category: toArray(searchParams.category),
    priceMin,
    priceMax,
    sortBy,
    page: toPositiveInt(searchParams.page, 1),
    limit: toPositiveInt(searchParams.limit, 24),
  };
}

/**
 * Normalises a ProductQueryParams object: applies defaults for sortBy/page/limit
 * and clamps limit to [1, 100]. Pass the result to getAllProducts() to guarantee
 * consistent behaviour regardless of how params were assembled.
 */
export function buildProductQueryObject(
  params: ProductQueryParams
): ProductQueryParams {
  return {
    ...params,
    sortBy: params.sortBy ?? "newest",
    page: Math.max(1, params.page ?? 1),
    limit: Math.min(Math.max(1, params.limit ?? 24), 100),
  };
}
