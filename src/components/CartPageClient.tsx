"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { useCartStore, type CartLineItem } from "@/store/cart";
import { formatPrice, DELIVERY_FEE } from "@/lib/utils/currency";
import { updateCartItem, removeCartItem } from "@/lib/actions/cart";

// ── Constants ─────────────────────────────────────────────────────────────────

// ── Sub-components ────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
  disabled,
}: {
  item: CartLineItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  disabled: boolean;
}) {
  const displayPrice = (item.salePrice ?? item.price) * item.quantity;

  return (
    <div className="flex gap-4 py-6 border-b border-light-300 last:border-b-0">
      {/* Thumbnail */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-light-200 sm:h-28 sm:w-28">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag size={24} className="text-light-400" aria-hidden />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-body-medium font-jost text-dark-900 leading-tight truncate">
              {item.name}
            </h3>
            <p className="text-caption font-jost text-dark-700">
              {item.description}
            </p>
          </div>
          {/* Price — right-aligned, top of the card */}
          <span className="text-body-medium font-jost text-dark-900 shrink-0">
            {formatPrice(displayPrice)}
          </span>
        </div>

        {/* Size + Quantity row */}
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <span className="text-caption font-jost text-dark-700">
            Size{" "}
            <span className="text-dark-900 font-medium">{item.sizeName}</span>
          </span>

          {/* Quantity stepper */}
          <div className="flex items-center gap-2">
            <span className="text-caption font-jost text-dark-700">
              Quantity
            </span>
            <div className="flex items-center gap-1 rounded border border-light-300">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={disabled}
                onClick={() =>
                  item.quantity > 1
                    ? onUpdateQty(item.cartItemId, item.quantity - 1)
                    : onRemove(item.cartItemId)
                }
                className="flex h-8 w-8 items-center justify-center text-dark-700 hover:text-dark-900 disabled:opacity-40 transition"
              >
                <Minus size={14} aria-hidden />
              </button>
              <span className="min-w-6 text-center text-body font-jost text-dark-900">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={disabled}
                onClick={() => onUpdateQty(item.cartItemId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center text-dark-700 hover:text-dark-900 disabled:opacity-40 transition"
              >
                <Plus size={14} aria-hidden />
              </button>
            </div>
          </div>

          {/* Delete */}
          <button
            type="button"
            aria-label={`Remove ${item.name} from cart`}
            disabled={disabled}
            onClick={() => onRemove(item.cartItemId)}
            className="ml-auto text-red hover:opacity-70 disabled:opacity-40 transition"
          >
            <Trash2 size={18} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({
  subtotal,
  isAuthenticated,
}: {
  subtotal: number;
  isAuthenticated: boolean;
}) {
  const total = subtotal + DELIVERY_FEE;

  return (
    <div className="rounded-lg border border-light-300 bg-light-100 p-6 sticky top-24">
      <h2 className="text-heading-3 font-jost text-dark-900 mb-5">Summary</h2>

      <div className="flex flex-col gap-3 text-body font-jost">
        <div className="flex justify-between">
          <span className="text-dark-700">Subtotal</span>
          <span className="text-dark-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-700">Estimated Delivery &amp; Handling</span>
          <span className="text-dark-900">{formatPrice(DELIVERY_FEE)}</span>
        </div>
      </div>

      <div className="my-5 border-t border-light-300" />

      <div className="flex justify-between text-body-medium font-jost text-dark-900 mb-5">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      {isAuthenticated ? (
        <Link
          href="/checkout"
          className="flex w-full items-center justify-center rounded-full bg-dark-900 px-6 py-4 text-body-medium font-jost text-light-100 hover:bg-dark-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
        >
          Proceed to Checkout
        </Link>
      ) : (
        <Link
          href="/sign-in"
          className="flex w-full items-center justify-center rounded-full bg-dark-900 px-6 py-4 text-body-medium font-jost text-light-100 hover:bg-dark-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
        >
          Sign in to Checkout
        </Link>
      )}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32 text-center font-jost px-4">
      <ShoppingBag size={56} className="text-light-400" aria-hidden />
      <div className="flex flex-col gap-2">
        <h2 className="text-heading-3 text-dark-900">Your bag is empty</h2>
        <p className="text-body text-dark-700 max-w-xs mx-auto">
          Add items from the store and they&apos;ll appear here.
        </p>
      </div>
      <Link
        href="/products"
        className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 transition"
      >
        Shop Now
      </Link>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

interface CartPageClientProps {
  initialItems: CartLineItem[];
  isAuthenticated: boolean;
}

export default function CartPageClient({
  initialItems,
  isAuthenticated,
}: CartPageClientProps) {
  const [items, setLocalItems] = useState<CartLineItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const setStoreItems = useCartStore((s) => s.setItems);

  // Keep Zustand in sync so the Navbar count is always accurate.
  useEffect(() => {
    setStoreItems(items);
  }, [items, setStoreItems]);

  const handleUpdateQty = (cartItemId: string, quantity: number) => {
    // Optimistic update
    setLocalItems((prev) =>
      quantity < 1
        ? prev.filter((i) => i.cartItemId !== cartItemId)
        : prev.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i,
          ),
    );

    startTransition(async () => {
      const updated = await updateCartItem(cartItemId, quantity);
      setLocalItems(updated);
    });
  };

  const handleRemove = (cartItemId: string) => {
    // Optimistic update
    setLocalItems((prev) =>
      prev.filter((i) => i.cartItemId !== cartItemId),
    );

    startTransition(async () => {
      const updated = await removeCartItem(cartItemId);
      setLocalItems(updated);
    });
  };

  const subtotal = items.reduce(
    (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 font-jost">
      <h1 className="text-heading-3 font-jost font-medium text-dark-900 mb-8">
        Cart
      </h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ── Items list ── */}
          <div
            className={`flex-1 min-w-0 transition-opacity ${isPending ? "opacity-60 pointer-events-none" : ""}`}
          >
            {items.map((item) => (
              <CartItemRow
                key={item.cartItemId}
                item={item}
                onUpdateQty={handleUpdateQty}
                onRemove={handleRemove}
                disabled={isPending}
              />
            ))}
          </div>

          {/* ── Summary panel ── */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <OrderSummary
              subtotal={subtotal}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
