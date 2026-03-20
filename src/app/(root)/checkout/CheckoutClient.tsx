"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Lock, ArrowLeft, Truck, CreditCard, MapPin, Phone } from "lucide-react";
import type { CartLineItem } from "@/store/cart";
import { formatPrice, DELIVERY_FEE } from "@/lib/utils/currency";
import { initiateCheckout, initiateCodCheckout } from "@/lib/actions/checkout";
import type { ShippingAddressInput } from "@/lib/actions/checkout";

// ── Sub-components ────────────────────────────────────────────────────────────

function OrderItemRow({ item }: { item: CartLineItem }) {
  const displayPrice = (item.salePrice ?? item.price) * item.quantity;

  return (
    <div className="flex gap-3 py-3 border-b border-light-300 last:border-b-0">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-light-200">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag size={18} className="text-light-400" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-between min-w-0">
        <div className="min-w-0">
          <p className="text-body font-jost text-dark-900 leading-tight truncate">
            {item.name}
          </p>
          <p className="text-caption font-jost text-dark-700">
            Size {item.sizeName} · {item.colorName} · Qty {item.quantity}
          </p>
        </div>
        <span className="text-body font-jost text-dark-900 shrink-0 ml-3">
          {formatPrice(displayPrice)}
        </span>
      </div>
    </div>
  );
}

type PaymentMethod = "flutterwave" | "cod";

// ── Main client component ─────────────────────────────────────────────────────

interface CheckoutClientProps {
  items: CartLineItem[];
  user: { name: string; email: string };
}

export default function CheckoutClient({ items, user }: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // Address form state
  const [address, setAddress] = useState<ShippingAddressInput>({
    line1: "",
    streetName: "",
    city: "",
    state: "",
    phone: "",
  });

  const subtotal = items.reduce(
    (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
    0,
  );
  const totalAmount = subtotal + DELIVERY_FEE;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleAddressChange = (field: keyof ShippingAddressInput, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePay = () => {
    setError(null);

    if (paymentMethod === "cod") {
      // Validate address fields client-side
      if (!address.line1 || !address.streetName || !address.city || !address.state || !address.phone) {
        setError("Please fill in all delivery address fields.");
        return;
      }
      if (address.phone.length < 10) {
        setError("Phone number must be at least 10 digits.");
        return;
      }
    }

    startTransition(async () => {
      if (paymentMethod === "flutterwave") {
        const result = await initiateCheckout();
        if (!result.success) {
          setError(result.error ?? "Something went wrong.");
          return;
        }
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        }
      } else {
        const result = await initiateCodCheckout(address);
        if (!result.success) {
          setError(result.error ?? "Something went wrong.");
          return;
        }
        router.push(`/orders/${result.orderId}`);
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 font-jost">
      {/* Back link */}
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-body text-dark-700 hover:text-dark-900 transition mb-6"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to cart
      </Link>

      <h1 className="text-heading-3 font-jost font-medium text-dark-900 mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left — Order details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Customer info card */}
          <div className="rounded-lg border border-light-300 p-5">
            <h2 className="text-body-medium font-jost text-dark-900 mb-3">
              Customer Information
            </h2>
            <div className="text-body font-jost text-dark-700 space-y-1">
              <p>{user.name}</p>
              <p>{user.email}</p>
            </div>
          </div>

          {/* Payment method selection */}
          <div className="rounded-lg border border-light-300 p-5">
            <h2 className="text-body-medium font-jost text-dark-900 mb-4">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 transition ${
                  paymentMethod === "cod"
                    ? "border-dark-900 bg-light-200"
                    : "border-light-300 hover:border-dark-500"
                }`}
              >
                <Truck size={22} className="text-dark-900 shrink-0" />
                <div className="text-left">
                  <p className="text-body-medium font-jost text-dark-900">
                    Cash on Delivery
                  </p>
                  <p className="text-footnote font-jost text-dark-700">
                    Pay when you receive your order
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("flutterwave")}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 transition ${
                  paymentMethod === "flutterwave"
                    ? "border-dark-900 bg-light-200"
                    : "border-light-300 hover:border-dark-500"
                }`}
              >
                <CreditCard size={22} className="text-dark-900 shrink-0" />
                <div className="text-left">
                  <p className="text-body-medium font-jost text-dark-900">
                    Pay Online
                  </p>
                  <p className="text-footnote font-jost text-dark-700">
                    Mobile Money / Card via Flutterwave
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Shipping address form (shown for COD) */}
          {paymentMethod === "cod" && (
            <div className="rounded-lg border border-light-300 p-5">
              <h2 className="text-body-medium font-jost text-dark-900 mb-4 flex items-center gap-2">
                <MapPin size={18} aria-hidden />
                Delivery Address
              </h2>
              <p className="text-footnote text-dark-700 mb-4">
                Our delivery guy will bring your order to this address. Please be as specific as possible.
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="text-caption font-jost text-dark-900 mb-1 flex items-center gap-1.5">
                    <Phone size={14} aria-hidden />
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 0771234567"
                    value={address.phone}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                    className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body font-jost text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900"
                  />
                </div>

                <div>
                  <label htmlFor="line1" className="text-caption font-jost text-dark-900 mb-1 block">
                    Address / Area *
                  </label>
                  <input
                    id="line1"
                    type="text"
                    placeholder="e.g. Wandegeya, Kampala"
                    value={address.line1}
                    onChange={(e) => handleAddressChange("line1", e.target.value)}
                    className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body font-jost text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900"
                  />
                </div>

                <div>
                  <label htmlFor="streetName" className="text-caption font-jost text-dark-900 mb-1 block">
                    Street Name *
                  </label>
                  <input
                    id="streetName"
                    type="text"
                    placeholder="e.g. Bombo Road"
                    value={address.streetName}
                    onChange={(e) => handleAddressChange("streetName", e.target.value)}
                    className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body font-jost text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="text-caption font-jost text-dark-900 mb-1 block">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      placeholder="e.g. Kampala"
                      value={address.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body font-jost text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="text-caption font-jost text-dark-900 mb-1 block">
                      District *
                    </label>
                    <input
                      id="state"
                      type="text"
                      placeholder="e.g. Central"
                      value={address.state}
                      onChange={(e) => handleAddressChange("state", e.target.value)}
                      className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body font-jost text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order items card */}
          <div className="rounded-lg border border-light-300 p-5">
            <h2 className="text-body-medium font-jost text-dark-900 mb-3">
              Order Items ({totalItems})
            </h2>
            <div>
              {items.map((item) => (
                <OrderItemRow key={item.cartItemId} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Right — Summary + Pay button */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-light-300 bg-light-100 p-6 sticky top-24">
            <h2 className="text-heading-3 font-jost text-dark-900 mb-5">
              Summary
            </h2>

            <div className="flex flex-col gap-3 text-body font-jost">
              <div className="flex justify-between">
                <span className="text-dark-700">Subtotal</span>
                <span className="text-dark-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-700">
                  Estimated Delivery &amp; Handling
                </span>
                <span className="text-dark-900">
                  {formatPrice(DELIVERY_FEE)}
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-light-300" />

            <div className="flex justify-between text-body-medium font-jost text-dark-900 mb-5">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            {error && (
              <p className="text-caption font-jost text-red mb-4">{error}</p>
            )}

            <button
              type="button"
              disabled={isPending}
              onClick={handlePay}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium font-jost text-light-100 hover:bg-dark-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900 disabled:opacity-60"
            >
              {paymentMethod === "cod" ? (
                <>
                  <Truck size={16} aria-hidden />
                  {isPending ? "Placing Order…" : "Place Order — Cash on Delivery"}
                </>
              ) : (
                <>
                  <Lock size={16} aria-hidden />
                  {isPending ? "Processing…" : "Pay with Flutterwave"}
                </>
              )}
            </button>

            <p className="text-footnote text-dark-500 text-center mt-3">
              {paymentMethod === "cod"
                ? "You'll pay the delivery guy when you receive and verify your products."
                : "You'll be redirected to Flutterwave's secure payment page."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
