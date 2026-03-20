"use server";

import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { db, dbRead } from "@/db";
import {
  brands,
  categories,
  collections,
  colors,
  genders,
  productCollections,
  productImages,
  products,
  productVariants,
  reviews,
  sizes,
  user,
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
  /** Derived badge label ("Best Seller", "Extra X% off", etc.) or null. */
  badge: string | null;
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
 *  3. Fetch one representative image per product + collection slugs, both in a
 *     single follow-up round-trip (Promise.all):
 *       - Images: color-specific if a color filter is active, else generic.
 *       - Collections: used to derive badge labels (e.g. "Best Seller").
 *  Total round-trips to the DB: 2 (count+data in parallel, then images+collections).
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
        // Badge signals: sale presence and best discount across all variants
        hasSale:      sql<boolean>`bool_or(${productVariants.salePrice} is not null)`,
        maxDiscountPct: sql<number | null>`
          max(
            case
              when ${productVariants.salePrice} is not null
              then round((1 - ${productVariants.salePrice}::numeric / ${productVariants.price}::numeric) * 100)::int
              else null
            end
          )
        `,
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

  // ── Image + collection queries in parallel (single round-trip each) ─────
  type ImageRow = {
    productId: string;
    variantId: string | null;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
  };

  const imageQueryNoColor = dbRead
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

  const imageQueryWithColor = color?.length
    ? dbRead
        .select({
          productId: productImages.productId,
          variantId: productImages.variantId,
          url:        productImages.url,
          isPrimary:  productImages.isPrimary,
          sortOrder:  productImages.sortOrder,
        })
        .from(productImages)
        .leftJoin(productVariants, eq(productVariants.id, productImages.variantId))
        .leftJoin(colors, eq(colors.id, productVariants.colorId))
        .where(
          and(
            inArray(productImages.productId, productIds),
            or(
              isNull(productImages.variantId),
              inArray(colors.slug, color),
            ),
          )
        )
        .orderBy(
          sql`case when ${productImages.variantId} is not null then 0 else 1 end`,
          desc(productImages.isPrimary),
          asc(productImages.sortOrder),
        )
    : null;

  const collectionQuery = dbRead
    .select({
      productId:      productCollections.productId,
      collectionSlug: collections.slug,
    })
    .from(productCollections)
    .innerJoin(collections, eq(collections.id, productCollections.collectionId))
    .where(inArray(productCollections.productId, productIds));

  const [imageRows, collectionRows] = await Promise.all([
    color?.length ? imageQueryWithColor! : imageQueryNoColor,
    collectionQuery,
  ]) as [ImageRow[], { productId: string; collectionSlug: string }[]];

  // productId → first image URL
  const imageMap = new Map<string, string>();
  for (const img of imageRows) {
    if (!imageMap.has(img.productId)) imageMap.set(img.productId, img.url);
  }

  // productId → Set of collection slugs
  const collectionMap = new Map<string, Set<string>>();
  for (const row of collectionRows) {
    if (!collectionMap.has(row.productId)) collectionMap.set(row.productId, new Set());
    collectionMap.get(row.productId)!.add(row.collectionSlug);
  }

  // Derive badge label for each product
  function deriveBadge(
    productId: string,
    hasSale: boolean,
    maxDiscountPct: number | null,
  ): string | null {
    const slugs = collectionMap.get(productId);
    if (slugs?.has("best-sellers"))         return "Best Seller";
    if (slugs?.has("sustainable-materials")) return "Sustainable Materials";
    if (hasSale && maxDiscountPct != null && maxDiscountPct > 0) {
      // Round down to nearest 10 for clean label (e.g. 23% → "Extra 20% off")
      const rounded = Math.floor(maxDiscountPct / 10) * 10;
      return rounded > 0 ? `Extra ${rounded}% off` : null;
    }
    return null;
  }

  return {
    products: dataRows.map((row) => ({
      id:           row.id,
      name:         row.name,
      description:  row.description,
      minPrice:     row.minPrice,
      maxPrice:     row.maxPrice,
      colorCount:   row.colorCount,
      genderSlug:   row.genderSlug,
      genderLabel:  row.genderLabel,
      brandName:    row.brandName,
      brandSlug:    row.brandSlug,
      categoryName: row.categoryName,
      categorySlug: row.categorySlug,
      createdAt:    row.createdAt,
      image:        imageMap.get(row.id) ?? null,
      badge:        deriveBadge(row.id, row.hasSale, row.maxDiscountPct ?? null),
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

// ---------------------------------------------------------------------------
// getProductReviews
// ---------------------------------------------------------------------------

export type ReviewItem = {
  id: string;
  author: string;
  rating: number;
  content: string | null;
  /** ISO-8601 string — safe to serialize across the server/client boundary. */
  createdAt: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns up to 10 reviews for a product, sorted newest-first.
 * Joins with the user table to resolve the author's display name.
 * Returns an empty array when the product has no reviews.
 */
export async function getProductReviews(
  productId: string,
): Promise<ReviewItem[]> {
  if (!UUID_RE.test(productId)) return [];

  const rows = await dbRead
    .select({
      id:          reviews.id,
      rating:      reviews.rating,
      content:     reviews.comment,
      createdAt:   reviews.createdAt,
      authorName:  user.name,
      authorEmail: user.email,
    })
    .from(reviews)
    .innerJoin(user, eq(user.id, reviews.userId))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  return rows.map((r) => ({
    id:        r.id,
    author:    r.authorName ?? r.authorEmail.split("@")[0] ?? "Shopper",
    rating:    r.rating,
    content:   r.content ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// submitReview
// ---------------------------------------------------------------------------

export type SubmitReviewResult = {
  success: boolean;
  error?: string;
};

/**
 * Creates a new review for a product. Requires an authenticated user.
 * Validates rating (1–5) and optional comment (max 2000 chars).
 * Prevents duplicate reviews — one review per user per product.
 */
export async function submitReview(
  productId: string,
  rating: number,
  comment: string,
): Promise<SubmitReviewResult> {
  // Lazy-import to avoid circular dependency
  const { getSession } = await import("@/lib/auth/actions");
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: "You must be signed in to leave a review." };
  }

  // Validate inputs
  if (!UUID_RE.test(productId)) {
    return { success: false, error: "Invalid product." };
  }
  const ratingInt = Math.round(rating);
  if (ratingInt < 1 || ratingInt > 5) {
    return { success: false, error: "Rating must be between 1 and 5." };
  }
  const trimmed = comment.trim().slice(0, 2000);

  // Check for duplicate review
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.userId, session.user.id)))
    .limit(1);

  if (existing) {
    return { success: false, error: "You have already reviewed this product." };
  }

  // Insert review
  await db.insert(reviews).values({
    productId,
    userId: session.user.id,
    rating: ratingInt,
    comment: trimmed || null,
  });

  // Revalidate the product page so the new review shows immediately
  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/products/${productId}`);

  return { success: true };
}

// ---------------------------------------------------------------------------
// getRecommendedProducts
// ---------------------------------------------------------------------------

export type RecommendedProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  badge: string | null;
};

/**
 * Returns up to 4 published products in the same category or gender,
 * excluding the current product.
 * Fetches primary images in a single follow-up query to avoid N+1.
 * Returns an empty array when no related products are found.
 */
export async function getRecommendedProducts(
  productId: string,
): Promise<RecommendedProduct[]> {
  if (!UUID_RE.test(productId)) return [];

  // ── Step 1: fetch current product's category + gender ─────────────────
  const [current] = await dbRead
    .select({ categoryId: products.categoryId, genderId: products.genderId })
    .from(products)
    .where(and(eq(products.id, productId), isNull(products.deletedAt)))
    .limit(1);

  if (!current) return [];

  // ── Step 2: related products (same category OR same gender) ───────────
  const rows = await dbRead
    .select({
      id:          products.id,
      name:        products.name,
      description: products.description,
      minPrice:    sql<string>`min(${productVariants.price}::numeric)::text`,
      hasSale:     sql<boolean>`bool_or(${productVariants.salePrice} is not null)`,
      maxDiscountPct: sql<number | null>`
        max(
          case
            when ${productVariants.salePrice} is not null
            then round((1 - ${productVariants.salePrice}::numeric / ${productVariants.price}::numeric) * 100)::int
            else null
          end
        )
      `,
    })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .where(
      and(
        eq(products.isPublished, true),
        isNull(products.deletedAt),
        ne(products.id, productId),
        or(
          eq(products.categoryId, current.categoryId),
          eq(products.genderId,   current.genderId),
        ),
      ),
    )
    .groupBy(products.id, products.name, products.description)
    .orderBy(desc(products.createdAt))
    .limit(4);

  if (!rows.length) return [];

  // ── Step 3: primary image per product (one query, no N+1) ──────────────
  const ids = rows.map((r) => r.id);
  const imageRows = await dbRead
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(
      and(
        inArray(productImages.productId, ids),
        isNull(productImages.variantId),
      ),
    )
    .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

  const imageMap = new Map<string, string>();
  for (const img of imageRows) {
    if (!imageMap.has(img.productId)) imageMap.set(img.productId, img.url);
  }

  return rows.map((r) => {
    const pct = r.hasSale && r.maxDiscountPct != null ? r.maxDiscountPct : 0;
    const rounded = Math.floor(pct / 10) * 10;
    return {
      id:          r.id,
      name:        r.name,
      description: r.description,
      price:       `$${Number(r.minPrice).toFixed(2)}`,
      image:       imageMap.get(r.id) ?? null,
      badge:       rounded > 0 ? `Extra ${rounded}% off` : null,
    };
  });
}
