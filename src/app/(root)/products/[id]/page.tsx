import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

import ProductGallery from "@/components/ProductGallery";
import Card from "@/components/Card";
import { getProductById, RELATED_PRODUCTS } from "@/lib/mock/product";

// ---------------------------------------------------------------------------
// Next.js App Router — params is a Promise in v15+
// ---------------------------------------------------------------------------

type PageParams = Promise<{ id: string }>;

// ---------------------------------------------------------------------------
// Dynamic metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — Ecommerce Shoe Store`,
    description: product.description,
  };
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
  const product = getProductById(id);

  if (!product) notFound();

  return (
    <div className="font-jost">
      {/* ----------------------------------------------------------------
          Breadcrumb / back navigation (server-rendered)
          ---------------------------------------------------------------- */}
      <div className="border-b border-light-300">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8"
        >
          <Link
            href="/products"
            className="flex items-center gap-1 text-caption text-dark-700 hover:text-dark-900 transition"
          >
            <ChevronLeft size={14} aria-hidden />
            Back to Products
          </Link>
          <span className="text-caption text-dark-500" aria-hidden>
            /
          </span>
          <span className="text-caption text-dark-900 truncate max-w-50" aria-current="page">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ----------------------------------------------------------------
          Product detail section
          Gallery + info are rendered by the client component which
          manages variant / image selection state.
          The "You Might Also Like" section below is fully server-rendered.
          ---------------------------------------------------------------- */}
      <section
        aria-label="Product details"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <ProductGallery product={product} />
      </section>

      {/* ----------------------------------------------------------------
          You Might Also Like (server-rendered)
          ---------------------------------------------------------------- */}
      <section
        aria-label="You might also like"
        className="border-t border-light-300 bg-light-200"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-heading-3 font-jost text-dark-900 mb-6">
            You Might Also Like
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RELATED_PRODUCTS.filter((p) => p.id !== id).map((related) => (
              <Card
                key={related.id}
                href={`/products/${related.id}`}
                image={related.image}
                title={related.title}
                description={`${related.description} · ${related.colorCount} colour${related.colorCount !== 1 ? "s" : ""}`}
                price={related.price}
                badge={related.badge}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
