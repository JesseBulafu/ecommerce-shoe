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
