import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";

import ProductGallery from "@/components/ProductGallery";
import ReviewsContent from "@/components/ReviewsContent";
import RecommendedProductsSection from "@/components/RecommendedProductsSection";
import {
  getProductById,
  type MockProduct,
  type MockVariant,
  type MockSize,
} from "@/lib/mock/product";
import {
  getProduct,
  getProductReviews,
  type ProductDetail,
} from "@/lib/actions/product";

// ---------------------------------------------------------------------------
// Next.js App Router — params is a Promise in v15+
// ---------------------------------------------------------------------------

type PageParams = Promise<{ id: string }>;

// ---------------------------------------------------------------------------
// Adapter: convert a real DB ProductDetail into the MockProduct UI shape.
// Groups DB variants by colour so the gallery colour-swatch UI works correctly.
// ---------------------------------------------------------------------------

function dbProductToMock(db: ProductDetail): MockProduct {
  // ── Group variants by colour ──────────────────────────────────────────
  type ColourGroup = { colorName: string; variantIds: Set<string>; images: string[] };
  const colorMap = new Map<string, ColourGroup>();

  for (const v of db.variants) {
    if (!colorMap.has(v.color.id)) {
      colorMap.set(v.color.id, { colorName: v.color.name, variantIds: new Set(), images: [] });
    }
    colorMap.get(v.color.id)!.variantIds.add(v.id);
  }

  // ── Assign images to colour groups ─────────────────────────────────────
  // Product-level images (variantId null) → first colour group.
  // Variant-level images → colour group that owns that variant.
  const firstColorId = colorMap.keys().next().value as string | undefined;

  for (const img of db.images) {
    if (img.variantId === null) {
      if (firstColorId) colorMap.get(firstColorId)!.images.push(img.url);
    } else {
      for (const [, group] of colorMap) {
        if (group.variantIds.has(img.variantId)) {
          group.images.push(img.url);
          break;
        }
      }
    }
  }

  // Fallback: if a colour group has no images, assign the first available images
  const fallbackImages = db.images.slice(0, 4).map((i) => i.url);
  const variants: MockVariant[] = Array.from(colorMap.values()).map((group, i) => ({
    id: `v-${i}`,
    color: group.colorName,
    images: group.images.length > 0 ? group.images : fallbackImages,
  }));

  // ── Sizes: unique sizes, available when any variant of that size has stock ─
  const sizeMap = new Map<string, { label: string; available: boolean; sortOrder: number }>();
  for (const v of db.variants) {
    const existing = sizeMap.get(v.size.slug);
    const available = v.inStock > 0;
    if (!existing) {
      sizeMap.set(v.size.slug, { label: v.size.name, available, sortOrder: v.size.sortOrder });
    } else if (available) {
      sizeMap.get(v.size.slug)!.available = true;
    }
  }
  const sizes: MockSize[] = Array.from(sizeMap.values())
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ label, available }) => ({ label, available }));

  // ── Price ───────────────────────────────────────────────────────────────
  const prices = db.variants.map((v) => Number(v.price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  // ── Sale badge ──────────────────────────────────────────────────────────
  const salePrices = db.variants
    .filter((v) => v.salePrice != null)
    .map((v) => Number(v.salePrice));
  const salePrice = salePrices.length > 0 ? Math.min(...salePrices) : null;
  const discountPct =
    salePrice != null
      ? Math.floor(((minPrice - salePrice) / minPrice) * 100)
      : null;
  const promoText =
    discountPct && discountPct > 0 ? `Extra ${discountPct}% off w/ sale` : null;

  // ── Variant map: "ColorName:SizeName" → real DB variant UUID ────────────
  const variantMap: Record<string, string> = {};
  for (const v of db.variants) {
    const key = `${v.color.name}:${v.size.name}`;
    variantMap[key] = v.id;
  }

  return {
    id: db.id,
    name: db.name,
    category: db.category?.name ?? "Shoes",
    gender: db.gender?.label ?? "",
    badge: null,
    price: salePrice ?? minPrice,
    compareAtPrice: salePrice != null ? minPrice : null,
    promoText,
    description: db.description,
    specs: db.variants[0]?.sku ? [`Style: ${db.variants[0].sku}`] : [],
    styleCode: db.variants[0]?.sku ?? "",
    variants: variants.length > 0 ? variants : [{ id: "v-0", color: "Default", images: fallbackImages }],
    sizes: sizes.length > 0 ? sizes : [],
    variantMap,
  };
}

// ---------------------------------------------------------------------------
// Resolve: mock first → DB fallback
// ---------------------------------------------------------------------------

async function resolveProduct(id: string): Promise<MockProduct | null> {
  const mock = getProductById(id);
  if (mock) return mock;

  const db = await getProduct(id);
  if (!db) return null;

  return dbProductToMock(db);
}

// ---------------------------------------------------------------------------
// Dynamic metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — Ecommerce Shoe Store`,
    description: product.description,
  };
}

// ---------------------------------------------------------------------------
// Skeleton — shown while RecommendedProductsSection loads
// ---------------------------------------------------------------------------

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-light-300 aspect-square"
          aria-hidden
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styled Not Found — renders inline so navbar/footer remain visible
// ---------------------------------------------------------------------------

function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32 text-center font-jost px-4">
      <ShoppingBag size={56} className="text-light-400" aria-hidden />
      <div className="flex flex-col gap-2">
        <h1 className="text-heading-3 text-dark-900">Product not found</h1>
        <p className="text-body text-dark-700 max-w-sm mx-auto">
          This product may have been removed or the link is incorrect.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 transition"
        >
          Browse all products
        </Link>
        <Link
          href="/"
          className="rounded-full border border-light-300 px-6 py-3 text-body-medium text-dark-900 hover:border-dark-500 transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProductDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { id } = await params;

  // Fetch product + reviews in parallel — both are fast single queries.
  const [product, reviews] = await Promise.all([
    resolveProduct(id),
    getProductReviews(id),
  ]);

  // Render an inline Not Found block so the navbar and footer stay visible.
  if (!product) return <ProductNotFound />;

  // Compute review stats server-side; keeps ProductGallery client component stateless.
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
  // Round to nearest 0.5 star for the visual star display.
  const displayRating = Math.round(averageRating * 2) / 2;

  return (
    <div className="font-jost">
      {/* ----------------------------------------------------------------
          Breadcrumb
          ---------------------------------------------------------------- */}
      <div className="border-b border-light-300">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            className="text-caption text-dark-700 hover:text-dark-900 transition"
          >
            Home
          </Link>
          <span className="text-caption text-dark-500" aria-hidden>/</span>
          <Link
            href="/products"
            className="text-caption text-dark-700 hover:text-dark-900 transition"
          >
            Products
          </Link>
          <span className="text-caption text-dark-500" aria-hidden>/</span>
          <span className="text-caption text-dark-900 truncate max-w-50" aria-current="page">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ----------------------------------------------------------------
          Gallery + product info
          ProductGallery is a client component managing interactive state
          (selected variant, image). Reviews are injected as a ReactNode
          slot so real review data stays server-rendered.
          ---------------------------------------------------------------- */}
      <section
        aria-label="Product details"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <ProductGallery
          product={product}
          reviewCount={reviewCount}
          averageRating={displayRating}
          reviewsSlot={<ReviewsContent reviews={reviews} />}
        />
      </section>

      {/* ----------------------------------------------------------------
          You Might Also Like
          Wrapped in Suspense — never blocks the main PDP render.
          RecommendedProductsSection fetches the DB independently.
          ---------------------------------------------------------------- */}
      <section
        aria-label="You might also like"
        className="border-t border-light-300 bg-light-200"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-heading-3 font-jost text-dark-900 mb-6">
            You Might Also Like
          </h2>
          <Suspense fallback={<ProductGridSkeleton />}>
            <RecommendedProductsSection productId={id} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
