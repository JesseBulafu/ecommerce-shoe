import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils/currency";
import AdminOrderActions from "./AdminOrderActions";

export const metadata: Metadata = {
  title: "Orders — Admin — Arstra",
};

function PaymentBadge({ method, status }: { method: string; status: string }) {
  if (method === "cod" && status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        COD Paid
      </span>
    );
  }
  if (method === "cod") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        COD Pending
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Paid
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-light-200 text-dark-500">
      <span className="h-1.5 w-1.5 rounded-full bg-dark-500" />
      Initiated
    </span>
  );
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-semibold text-dark-900 tracking-tight">Orders</h1>
          <p className="text-[15px] text-dark-500 mt-1">
            {orders.length} order{orders.length !== 1 && "s"} total
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-light-300 bg-light-100">
          <svg className="h-12 w-12 text-dark-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="text-[15px] text-dark-500">No orders yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-light-300/60 bg-light-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-light-300/60">
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Order</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Customer</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Phone</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Items</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Total</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Payment</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Date</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-300/40">
                {orders.map((order) => (
                  <tr key={order.id} className="group transition hover:bg-light-200/40">
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-semibold text-dark-900 font-mono tracking-tight">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-medium text-dark-900">{order.customerName ?? "—"}</p>
                      <p className="text-[12px] text-dark-500 mt-0.5">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-dark-700">
                      {order.phone ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex min-w-[28px] items-center justify-center rounded-lg bg-light-200 px-2 py-0.5 text-[13px] font-medium text-dark-700">
                        {order.itemCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-dark-900 tabular-nums">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-4 text-[12px] text-dark-500">
                      {new Date(order.createdAt).toLocaleDateString("en-UG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      {order.paymentMethod === "cod" && order.paymentStatus !== "completed" ? (
                        <AdminOrderActions orderId={order.id} />
                      ) : (
                        <span className="text-[12px] text-dark-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
