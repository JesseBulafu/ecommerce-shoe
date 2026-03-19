"use client";

import Image from "next/image";
import type { Product } from "@/db/schema";
import { useCartStore } from "@/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-6 transition group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {product.category}
        </span>
        <h2 className="text-lg font-bold leading-tight">{product.name}</h2>
        <p className="line-clamp-2 text-sm text-gray-500">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold">${product.price}</span>
          <button
            onClick={() => addItem(product)}
            className="cursor-pointer rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
