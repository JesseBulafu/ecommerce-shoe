import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Package, Clock, CheckCircle } from "lucide-react";
import { getOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils/currency";
import { requireAuth } from "@/lib/auth/guard";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Details — Arstra",
};

function StatusTimeline({ status, paymentMethod, paymentStatus }: { status: string; paymentMethod?: string; paymentStatus?: string }) {
  const isCod = paymentMethod === "cod";
  const isComplete = paymentStatus === "completed" || status === "paid" || status === "delivered";

  const steps = isCod
    ? [
        { label: "Order Placed", done: true },
        { label: "Awaiting Delivery", done: true },
        { label: "Delivered & Paid", done: isComplete },
      ]
    : [
        { label: "Order Placed", done: true },
        { label: "Payment", done: paymentStatus === "completed" || status === "paid" },
        { label: "Shipped", done: status === "shipped" || status === "delivered" },
        { label: "Delivered", done: status === "delivered" },
      ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
            step.done ? "bg-green text-light-100" : "bg-light-300 text-dark-500"
          }`}>
            {step.done ? <CheckCircle size={16} /> : <Clock size={16} />}
          </div>
          <span className={`text-caption font-jost ${step.done ? "text-dark-900" : "text-dark-500"}`}>
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${step.done ? "bg-green" : "bg-light-300"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireAuth("/orders");
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 font-jost">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-body text-dark-700 hover:text-dark-900 transition mb-6"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading-3 font-medium text-dark-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-caption text-dark-700 mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-UG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="rounded-lg border border-light-300 p-5 mb-6">
        <h2 className="text-body-medium text-dark-900 mb-4">Order Status</h2>
        <StatusTimeline
          status={order.status}
          paymentMethod={order.payment?.method}
          paymentStatus={order.payment?.status}
        />
        {order.payment?.method === "cod" && order.payment.status !== "completed" && (
          <div className="mt-4 rounded-lg bg-orange/5 border border-orange/20 p-4">
            <p className="text-caption text-orange font-medium">
              Cash on Delivery — Pending
            </p>
            <p className="text-footnote text-dark-700 mt-1">
              Our delivery team will contact you to arrange delivery. Please have cash ready when receiving.
            </p>
          </div>
        )}
        {order.payment?.method === "cod" && order.payment.status === "completed" && (
          <div className="mt-4 rounded-lg bg-green/5 border border-green/20 p-4">
            <p className="text-caption text-green font-medium">
              Payment Received — Complete
            </p>
            <p className="text-footnote text-dark-700 mt-1">
              Thank you! Your order has been completed successfully.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 rounded-lg border border-light-300 p-5">
          <h2 className="text-body-medium text-dark-900 mb-4">
            Items ({order.items.length})
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 py-3 border-b border-light-300 last:border-b-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-light-200">
                  {item.image ? (
                    <Image src={item.image} alt={item.productName} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package size={18} className="text-light-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <p className="text-body text-dark-900 leading-tight truncate">{item.productName}</p>
                    <p className="text-caption text-dark-700">
                      {item.sizeName && `Size ${item.sizeName}`}
                      {item.colorName && ` · ${item.colorName}`}
                      {` · Qty ${item.quantity}`}
                    </p>
                  </div>
                  <span className="text-body text-dark-900 shrink-0 ml-3">
                    {formatPrice(Number(item.priceAtPurchase) * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Summary + Address */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-lg border border-light-300 p-5">
            <h2 className="text-body-medium text-dark-900 mb-3">Summary</h2>
            <div className="flex justify-between text-body text-dark-700 mb-2">
              <span>Payment</span>
              <span className="text-dark-900 capitalize">
                {order.payment?.method === "cod" ? "Cash on Delivery" : order.payment?.method ?? "—"}
              </span>
            </div>
            <div className="border-t border-light-300 my-3" />
            <div className="flex justify-between text-body-medium text-dark-900">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Delivery Address */}
          {order.shippingAddress && (
            <div className="rounded-lg border border-light-300 p-5">
              <h2 className="text-body-medium text-dark-900 mb-3 flex items-center gap-2">
                <MapPin size={16} aria-hidden />
                Delivery Address
              </h2>
              <div className="text-body text-dark-700 space-y-1">
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.streetName && <p>{order.shippingAddress.streetName}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p className="flex items-center gap-1.5 mt-2">
                  <Phone size={14} aria-hidden />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
