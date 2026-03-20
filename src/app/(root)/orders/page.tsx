import type { Metadata } from "next";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { getUserOrders } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils/currency";
import { requireAuth } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "My Orders — Arstra",
};

function StatusBadge({ status, paymentMethod, paymentStatus }: { status: string; paymentMethod?: string; paymentStatus?: string }) {
  let label = status;
  let color = "bg-light-300 text-dark-700";

  if (paymentMethod === "cod") {
    if (paymentStatus === "completed") {
      label = "Completed";
      color = "bg-green/10 text-green";
    } else {
      label = "Pending — Cash on Delivery";
      color = "bg-orange/10 text-orange";
    }
  } else {
    if (status === "paid" || paymentStatus === "completed") {
      label = "Paid Online";
      color = "bg-green/10 text-green";
    } else if (status === "pending") {
      label = "Pending";
      color = "bg-orange/10 text-orange";
    } else if (status === "shipped") {
      label = "Shipped";
      color = "bg-blue-100 text-blue-700";
    } else if (status === "delivered") {
      label = "Delivered";
      color = "bg-green/10 text-green";
    } else if (status === "cancelled") {
      label = "Cancelled";
      color = "bg-red/10 text-red";
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-footnote font-jost font-medium ${color}`}>
      {label}
    </span>
  );
}

export default async function OrdersPage() {
  await requireAuth("/orders");
  const orders = await getUserOrders();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 font-jost">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-body text-dark-700 hover:text-dark-900 transition mb-6"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to store
      </Link>

      <h1 className="text-heading-3 font-medium text-dark-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-light-400 mb-4" />
          <p className="text-body text-dark-700 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-light-300 p-5 hover:border-dark-500 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-caption text-dark-700">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-footnote text-dark-500">
                    {new Date(order.createdAt).toLocaleDateString("en-UG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge
                  status={order.status}
                  paymentMethod={order.payment?.method}
                  paymentStatus={order.payment?.status}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-footnote text-dark-700">
                  {order.items.length} item{order.items.length !== 1 && "s"}
                </p>
                <p className="text-body-medium text-dark-900">
                  {formatPrice(order.totalAmount)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
