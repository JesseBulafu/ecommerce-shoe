"use server";

import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { dbRead } from "@/db";
import {
  brands,
  categories,
  colors,
  genders,
  productImages,
  products,
  productVariants,
  sizes,
} from "@/db/schema";
import type { ProductQueryParams } from "@/lib/utils/query";

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

export type ProductListItem = {
  id: string;
  name: string;
  description: string;
  minPrice: string;
  maxPrice: string;
  colorCount: number;
  genderSlug: string;
  genderLabel: string;
  brandName: string;
  brandSlug: string;
  categoryName: string;
  categorySlug: string;
  createdAt: Date;
  /** Primary image URL; null when the product has no images in the DB. */
  image: string | null;
};

export type ProductVariantDetail = {
  id: string;
  sku: string;
  price: string;
  salePrice: string | null;
  inStock: number;
  color: { id: string; name: string; slug: string; hexCode: string };
  size: { id: string; name: string; slug: string; sortOrder: number };
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  gender: { id: string; label: string; slug: string } | null;
  variants: ProductVariantDetail[];
  images: Array<{
    id: string;
    variantId: string | null;
    url: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
};

// ---------------------------------------------------------------------------
// getAllProducts
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated, filtered, and sorted list of published products.
 *
 * Strategy (avoids N+1):
 *  1. Build a single WHERE clause from all filters.
 *  2. Run COUNT query and data query **in parallel** using the same WHERE clause.
 *  3. Fetch one representative image per product in a single follow-up query:
 *       - If a color filter is active → prefer variant-specific images for that
 *         color, falling back to generic (variantId IS NULL) images.
 *       - Otherwise → generic primary/first image only.
 *  Total round-trips to the DB: 2 (count+data in parallel, then images).
 */
export async function getAllProducts(params: ProductQueryParams): Promise<{
  products: ProductListItem[];
  totalCount: number;
}> {
  const {
    search,
    gender,
    color,
    size,
    brand,
    category,
    priceMin,
    priceMax,
    sortBy = "newest",
    page = 1,
    limit = 24,
  } = params;

  const safeLimit = Math.min(Math.max(1, limit), 100);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safeLimit;

  // ── Build WHERE conditions ──────────────────────────────────────────────
  const conditions: (SQL | undefined)[] = [
    eq(products.isPublished, true),
    isNull(products.deletedAt),
  ];

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(ilike(products.name, term), ilike(products.description, term))
    );
  }

  if (gender?.length)   conditions.push(inArray(genders.slug,     gender));
  if (color?.length)    conditions.push(inArray(colors.slug,      color));
  if (size?.length)     conditions.push(inArray(sizes.slug,       size));
  if (brand?.length)    conditions.push(inArray(brands.slug,      brand));
  if (category?.length) conditions.push(inArray(categories.slug,  category));

  if (priceMin != null) {
    conditions.push(sql`${productVariants.price}::numeric >= ${priceMin}`);
  }
  if (priceMax != null) {
    conditions.push(sql`${productVariants.price}::numeric <= ${priceMax}`);
  }

  const whereClause = and(...conditions);

  // ── Sort expression ─────────────────────────────────────────────────────
  // Aggregated expressions can't be used with Drizzle's orderBy helpers
  // directly in a GROUP BY query, so we use sql`` for price sorts.
  const minPriceSql = sql`min(${productVariants.price}::numeric)`;
  const sortExpr =
    sortBy === "price_asc"  ? asc(minPriceSql)  :
    sortBy === "price_desc" ? desc(minPriceSql) :
                              desc(products.createdAt); // newest + featured

  // ── Count + data queries in parallel ────────────────────────────────────
  const [countRows, dataRows] = await Promise.all([
    // COUNT: distinct product IDs that satisfy all filters
    dbRead
      .select({ count: sql<number>`count(distinct ${products.id})::int` })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .innerJoin(genders,         eq(genders.id,    products.genderId))
      .innerJoin(colors,          eq(colors.id,     productVariants.colorId))
      .innerJoin(sizes,           eq(sizes.id,      productVariants.sizeId))
      .innerJoin(brands,          eq(brands.id,     products.brandId))
      .innerJoin(categories,      eq(categories.id, products.categoryId))
      .where(whereClause),

    // DATA: one row per product with aggregated price + color count
    dbRead
      .select({
        id:           products.id,
        name:         products.name,
        description:  products.description,
        createdAt:    products.createdAt,
        minPrice:     sql<string>`min(${productVariants.price}::numeric)::text`,
        maxPrice:     sql<string>`max(${productVariants.price}::numeric)::text`,
        colorCount:   sql<number>`count(distinct ${productVariants.colorId})::int`,
        genderSlug:   genders.slug,
        genderLabel:  genders.label,
        brandName:    brands.name,
        brandSlug:    brands.slug,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .innerJoin(genders,         eq(genders.id,    products.genderId))
      .innerJoin(colors,          eq(colors.id,     productVariants.colorId))
      .innerJoin(sizes,           eq(sizes.id,      productVariants.sizeId))
      .innerJoin(brands,          eq(brands.id,     products.brandId))
      .innerJoin(categories,      eq(categories.id, products.categoryId))
      .where(whereClause)
      .groupBy(
        products.id,
        products.name,
        products.description,
        products.createdAt,
        genders.slug,
        genders.label,
        brands.name,
        brands.slug,
        categories.name,
        categories.slug,
      )
      .orderBy(sortExpr)
      .limit(safeLimit)
      .offset(offset),
  ]);

  const totalCount = (countRows[0]?.count as number) ?? 0;
  if (dataRows.length === 0) return { products: [], totalCount };

  const productIds = dataRows.map((r) => r.id);

  // ── Image query (single round-trip for all returned products) ───────────
  // Order: variant-specific before generic, then by isPrimary DESC, sortOrder ASC.
  // We pick the first image per product in JS after the query.
  type ImageRow = {
    productId: string;
    variantId: string | null;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
  };

  let imageRows: ImageRow[];

  if (color?.length) {
    // Prefer images tied to the filtered color's variants; generic images are
    // fetched as a fallback in the same query.
    imageRows = await dbRead
      .select({
        productId: productImages.productId,
        variantId: productImages.variantId,
        url:        productImages.url,
        isPrimary:  productImages.isPrimary,
        sortOrder:  productImages.sortOrder,
      })
      .from(productImages)
      .leftJoin(
        productVariants,
        eq(productVariants.id, productImages.variantId)
      )
      .leftJoin(colors, eq(colors.id, productVariants.colorId))
      .where(
        and(
          inArray(productImages.productId, productIds),
          or(
            isNull(productImages.variantId),   // generic fallback
            inArray(colors.slug, color),        // color-specific
          ),
        )
      )
      .orderBy(
        // Variant-specific images rank above generic ones
        sql`case when ${productImages.variantId} is not null then 0 else 1 end`,
        desc(productImages.isPrimary),
        asc(productImages.sortOrder),
      );
  } else {
    // No color filter → fetch generic (variantId IS NULL) images only
    imageRows = await dbRead
      .select({
        productId: productImages.productId,
        variantId: productImages.variantId,
        url:        productImages.url,
        isPrimary:  productImages.isPrimary,
        sortOrder:  productImages.sortOrder,
      })
      .from(productImages)
      .where(
        and(
          inArray(productImages.productId, productIds),
          isNull(productImages.variantId),
        )
      )
      .orderBy(
        desc(productImages.isPrimary),
        asc(productImages.sortOrder),
      );
  }

  // Build productId → first-match image URL (rows are already priority-ordered)
  const imageMap = new Map<string, string>();
  for (const img of imageRows) {
    if (!imageMap.has(img.productId)) {
      imageMap.set(img.productId, img.url);
    }
  }

  return {
    products: dataRows.map((row) => ({
      ...row,
      image: imageMap.get(row.id) ?? null,
    })),
    totalCount,
  };
}

// ---------------------------------------------------------------------------
// getProduct
// ---------------------------------------------------------------------------

/**
 * Fetch the full detail of a single published product by ID.
 *
 * Uses Drizzle's relational query API (`with`) which issues batched sub-queries
 * under the hood — effectively a single logical round-trip on a connection pool.
 *
 * Returns null when:
 *  - The product does not exist.
 *  - The product is unpublished or soft-deleted.
 */
export async function getProduct(productId: string): Promise<ProductDetail | null> {
  const result = await dbRead.query.products.findFirst({
    where: (p, { and: _and, eq: _eq, isNull: _isNull }) =>
      _and(
        _eq(p.id, productId),
        _eq(p.isPublished, true),
        _isNull(p.deletedAt),
      ),
    columns: {
      id:          true,
      name:        true,
      description: true,
      isPublished: true,
      createdAt:   true,
      updatedAt:   true,
    },
    with: {
      category: { columns: { id: true, name: true, slug: true } },
      brand:    { columns: { id: true, name: true, slug: true } },
      gender:   { columns: { id: true, label: true, slug: true } },
      variants: {
        columns: {
          id:        true,
          sku:       true,
          price:     true,
          salePrice: true,
          inStock:   true,
        },
        with: {
          color: { columns: { id: true, name: true, slug: true, hexCode: true } },
          size:  { columns: { id: true, name: true, slug: true, sortOrder: true } },
        },
        orderBy: (v, { asc: _asc }) => [_asc(v.price)],
      },
      images: {
        columns: {
          id:        true,
          variantId: true,
          url:       true,
          sortOrder: true,
          isPrimary: true,
        },
        orderBy: (i, { desc: _desc, asc: _asc }) => [
          _desc(i.isPrimary),
          _asc(i.sortOrder),
        ],
      },
    },
  });

  if (!result) return null;
  return result as unknown as ProductDetail;
}
