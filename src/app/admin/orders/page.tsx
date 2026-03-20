import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils/currency";
import AdminOrderActions from "./AdminOrderActions";

export const metadata: Metadata = {
  title: "Orders — Admin — Arstra",
};

function PaymentBadge({ method, status }: { method: string; status: string }) {
  if (method === "cod" && status === "completed") {
    return <span className="inline-flex rounded-full px-2.5 py-0.5 text-footnote font-medium bg-green/10 text-green">COD — Paid</span>;
  }
  if (method === "cod") {
    return <span className="inline-flex rounded-full px-2.5 py-0.5 text-footnote font-medium bg-orange/10 text-orange">COD — Pending</span>;
  }
  if (status === "completed") {
    return <span className="inline-flex rounded-full px-2.5 py-0.5 text-footnote font-medium bg-green/10 text-green">Flutterwave — Paid</span>;
  }
  if (status === "failed") {
    return <span className="inline-flex rounded-full px-2.5 py-0.5 text-footnote font-medium bg-red/10 text-red">Failed</span>;
  }
  return <span className="inline-flex rounded-full px-2.5 py-0.5 text-footnote font-medium bg-light-300 text-dark-700">Initiated</span>;
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading-3 font-medium text-dark-900">Orders</h1>
          <p className="text-body text-dark-700 mt-1">
            {orders.length} order{orders.length !== 1 && "s"} total
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-body text-dark-500 text-center py-20">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-light-300">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-light-300 bg-light-200">
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Order</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Customer</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Phone</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Items</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Total</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Payment</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Date</th>
                <th className="px-4 py-3 text-caption text-dark-700 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-light-300 hover:bg-light-200/50 transition">
                  <td className="px-4 py-3">
                    <span className="text-caption text-dark-900 font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-caption text-dark-900">{order.customerName ?? "—"}</p>
                    <p className="text-footnote text-dark-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-caption text-dark-700">
                    {order.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-caption text-dark-700">
                    {order.itemCount}
                  </td>
                  <td className="px-4 py-3 text-caption text-dark-900 font-medium">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-footnote text-dark-500">
                    {new Date(order.createdAt).toLocaleDateString("en-UG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {order.paymentMethod === "cod" && order.paymentStatus !== "completed" ? (
                      <AdminOrderActions orderId={order.id} />
                    ) : (
                      <span className="text-footnote text-dark-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
