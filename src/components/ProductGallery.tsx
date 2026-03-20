"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Check,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import type { MockProduct } from "@/lib/mock/product";
import { formatPrice } from "@/lib/utils/currency";
import SizePicker from "./SizePicker";
import CollapsibleSection, { StarRating } from "./CollapsibleSection";
import { addCartItem } from "@/lib/actions/cart";
import { useCartStore } from "@/store/cart";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  product: MockProduct;
  /** Number of reviews to show in the section title. */
  reviewCount: number;
  /** Pre-computed average rating (0–5). Used for the star display. */
  averageRating: number;
  /**
   * React node rendered inside the Reviews collapsible.
   * Passed from the server page so real review data can be injected into
   * this client component without breaking the server/client boundary.
   */
  reviewsSlot: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Filter to only variants that have at least one valid-looking image path. */
function validVariants(product: MockProduct) {
  return product.variants.filter((v) => v.images.length > 0);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ProductGallery({
  product,
  reviewCount,
  averageRating,
  reviewsSlot,
}: Props) {
  const variants = validVariants(product);
  const [variantIdx, setVariantIdx] = useState(0);
  const [imageIdx, setImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addToBagMsg, setAddToBagMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const setStoreItems = useCartStore((s) => s.setItems);

  const currentVariant = variants[variantIdx] ?? null;
  const images = currentVariant?.images ?? [];
  const currentImage = images[imageIdx] ?? null;

  // Reset image index when variant changes
  const selectVariant = useCallback((idx: number) => {
    setVariantIdx(idx);
    setImageIdx(0);
  }, []);

  const goPrev = useCallback(
    () => setImageIdx((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const goNext = useCallback(
    () => setImageIdx((i) => (i + 1) % images.length),
    [images.length],
  );

  // Keyboard navigation on main image area
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  const handleAddToBag = () => {
    if (!selectedSize) {
      setAddToBagMsg("Please select a size.");
      return;
    }
    const colorName = currentVariant?.color ?? "";
    const variantId = product.variantMap[`${colorName}:${selectedSize}`];
    if (!variantId) {
      setAddToBagMsg("This combination is currently unavailable.");
      return;
    }
    setAddToBagMsg("");
    startTransition(async () => {
      try {
        const updated = await addCartItem(variantId, 1);
        setStoreItems(updated);
        setAddToBagMsg("✓ Added to bag!");
        setTimeout(() => setAddToBagMsg(""), 3000);
      } catch {
        setAddToBagMsg("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] xl:grid-cols-[7fr_5fr]">
      {/* ================================================================
          LEFT COLUMN — image gallery
          ================================================================ */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          {/* ---- Vertical thumbnail strip (hidden on mobile) ---- */}
          <div
            className="hidden sm:flex flex-col gap-2 w-18 shrink-0"
            role="list"
            aria-label="Product image thumbnails"
          >
            {images.length > 0 ? (
              images.map((src, i) => (
                <button
                  key={`${currentVariant?.id}-${i}`}
                  type="button"
                  role="listitem"
                  onClick={() => setImageIdx(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === imageIdx ? "true" : undefined}
                  className={[
                    "relative aspect-square w-full overflow-hidden rounded bg-light-200",
                    "border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900",
                    i === imageIdx
                      ? "border-dark-900"
                      : "border-transparent hover:border-dark-500",
                  ].join(" ")}
                >
                  <Image
                    src={src}
                    alt={`${product.name} — thumbnail ${i + 1}`}
                    fill
                    sizes="72px"
                    className="object-contain p-1"
                  />
                </button>
              ))
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded bg-light-200 text-dark-500">
                <ImageOff size={24} aria-hidden />
              </div>
            )}
          </div>

          {/* ---- Main image ---- */}
          <div
            className="relative flex-1 aspect-square overflow-hidden rounded-lg bg-light-200"
            aria-label="Main product image"
          >
            {/* Badge overlay */}
            {product.badge && (
              <div
                aria-label={product.badge}
                className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded bg-light-100/95 px-2.5 py-1 shadow-sm"
              >
                <Star size={12} className="fill-dark-900 text-dark-900" aria-hidden />
                <span className="text-caption font-jost text-dark-900">{product.badge}</span>
              </div>
            )}

            {/* Image or empty state */}
            {currentImage ? (
              <Image
                src={currentImage}
                alt={`${product.name} in ${currentVariant?.color}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 45vw"
                className="object-contain p-8"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-dark-500">
                <ImageOff size={72} aria-label="Image unavailable" />
              </div>
            )}

            {/* Navigation arrows */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous image"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-light-100 shadow-md hover:bg-light-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
                >
                  <ChevronLeft size={16} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next image"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-light-100 shadow-md hover:bg-light-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
                >
                  <ChevronRight size={16} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ---- Mobile horizontal thumbnail strip ---- */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 sm:hidden"
          role="list"
          aria-label="Product image thumbnails"
        >
          {images.map((src, i) => (
            <button
              key={`mob-${currentVariant?.id}-${i}`}
              type="button"
              role="listitem"
              onClick={() => setImageIdx(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === imageIdx ? "true" : undefined}
              className={[
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded bg-light-200",
                "border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900",
                i === imageIdx
                  ? "border-dark-900"
                  : "border-transparent hover:border-dark-500",
              ].join(" ")}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================
          RIGHT COLUMN — product info
          ================================================================ */}
      <div className="flex flex-col gap-5">
        {/* Badge + rating */}
        {product.badge && (
          <div className="flex items-center gap-2">
            <StarRating rating={4.5} />
            <span className="text-caption font-jost text-dark-700">{product.badge}</span>
          </div>
        )}

        {/* Name + category */}
        <div className="flex flex-col gap-1">
          <h1 className="text-heading-3 font-jost text-dark-900">{product.name}</h1>
          <p className="text-body font-jost text-dark-700">{product.category}</p>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <span className="text-lead font-jost text-dark-900">
            {formatPrice(product.price)}
          </span>
          {product.promoText && (
            <span className="text-caption font-jost text-green">{product.promoText}</span>
          )}
        </div>

        {/* ---- Color swatches ---- */}
        {variants.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-caption font-jost text-dark-700">
              {variants.length} Colour{variants.length !== 1 ? "s" : ""}
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Select colour"
            >
              {variants.map((variant, i) => {
                const isSelected = i === variantIdx;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => selectVariant(i)}
                    aria-label={`Select colour: ${variant.color}`}
                    aria-pressed={isSelected}
                    title={variant.color}
                    className={[
                      "relative aspect-square w-14 overflow-hidden rounded bg-light-200",
                      "border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900",
                      isSelected
                        ? "border-dark-900"
                        : "border-light-300 hover:border-dark-500",
                    ].join(" ")}
                  >
                    <Image
                      src={variant.images[0]}
                      alt={variant.color}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                    {isSelected && (
                      <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dark-900">
                        <Check size={10} className="text-light-100" aria-hidden />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size picker */}
        <SizePicker sizes={product.sizes} onSelect={setSelectedSize} />

        {/* Feedback message (error or success) */}
        {addToBagMsg && (
          <p
            className={`text-caption font-jost ${
              addToBagMsg.startsWith("✓")
                ? "text-green"
                : "text-red"
            }`}
          >
            {addToBagMsg}
          </p>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 pt-1">
          <button
            type="button"
            disabled={isPending}
            onClick={handleAddToBag}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium font-jost text-light-100 hover:bg-dark-700 disabled:opacity-60 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
          >
            <ShoppingBag size={18} aria-hidden />
            {isPending ? "Adding…" : "Add to Bag"}
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-light-300 px-6 py-4 text-body-medium font-jost text-dark-900 hover:border-dark-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
          >
            <Heart size={18} aria-hidden />
            Favourite
          </button>
        </div>

        {/* ---- Collapsible sections ---- */}
        <div className="mt-2">
          <CollapsibleSection title="Product Details" defaultOpen>
            <p className="mb-3">{product.description}</p>
            <ul className="flex flex-col gap-1 pl-4">
              {product.specs.map((spec) => (
                <li key={spec} className="list-disc text-body text-dark-700">
                  {spec}
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title="Shipping &amp; Returns">
            <p>
              Free standard shipping on orders over UGX 180,000. Orders typically arrive within
              3–5 business days. Easy 60-day returns on unworn items — simply use the
              prepaid return label included with your order.
            </p>
          </CollapsibleSection>

          <CollapsibleSection
            title={`Reviews (${reviewCount})`}
            headerExtra={
              reviewCount > 0 ? (
                <StarRating rating={averageRating} />
              ) : undefined
            }
          >
            {reviewsSlot}
          </CollapsibleSection>

          {/* Close border for last section */}
          <div className="border-t border-light-300" />
        </div>
      </div>
    </div>
  );
}
