"use client";

import Image from "next/image";
import { useTransition } from "react";
import type { ProductVariant } from "@/db/schema";
import { useCartStore } from "@/store/cart";
import { addCartItem } from "@/lib/actions/cart";

/** Display-ready data shape passed to the card. Decouples UI from raw DB rows. */
export interface ProductCardData {
  name: string;
  description: string;
  imageUrl: string;
  categoryName: string;
  defaultVariant: ProductVariant;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const setItems = useCartStore((s) => s.setItems);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    startTransition(async () => {
      const updated = await addCartItem(product.defaultVariant.id, 1);
      setItems(updated);
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-6 transition group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {product.categoryName}
        </span>
        <h2 className="text-lg font-bold leading-tight">{product.name}</h2>
        <p className="line-clamp-2 text-sm text-gray-500">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold">
            ${Number(product.defaultVariant.price).toFixed(2)}
          </span>
          <button
            disabled={isPending}
            onClick={handleAdd}
            className="cursor-pointer rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isPending ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
