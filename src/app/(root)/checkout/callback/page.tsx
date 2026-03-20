import type { Metadata } from "next";
import { verifyTransaction } from "@/lib/flutterwave";
import { db, dbRead } from "@/db";
import { payments, orders } from "@/db/schema/orders";
import { carts, cartItems } from "@/db/schema/carts";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Result — Ecommerce Shoe Store",
};

interface CallbackPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CheckoutCallbackPage({
  searchParams,
}: CallbackPageProps) {
  const params = await searchParams;
  const status = params.status as string | undefined;
  const txRef = params.tx_ref as string | undefined;
  const transactionId = params.transaction_id as string | undefined;

  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  // No transaction info — redirect to home
  if (!txRef || !transactionId) {
    redirect("/");
  }

  // Look up our payment record
  const [payment] = await dbRead
    .select({ id: payments.id, orderId: payments.orderId, status: payments.status })
    .from(payments)
    .where(eq(payments.transactionId, txRef))
    .limit(1);

  if (!payment) redirect("/");

  // Verify ownership: make sure this order belongs to the logged-in user
  const [order] = await dbRead
    .select({ userId: orders.userId })
    .from(orders)
    .where(eq(orders.id, payment.orderId))
    .limit(1);

  if (!order || order.userId !== session.user.id) redirect("/");

  // If payment is already completed, show success
  let paymentStatus: "success" | "failed" | "pending" = "pending";

  if (payment.status === "completed") {
    paymentStatus = "success";
  } else if (payment.status === "failed") {
    paymentStatus = "failed";
  } else if (status === "successful") {
    // Verify with Flutterwave
    try {
      const verification = await verifyTransaction(transactionId);

      if (
        verification.status === "success" &&
        verification.data.status === "successful" &&
        verification.data.tx_ref === txRef
      ) {
        // Update payment
        await db
          .update(payments)
          .set({
            status: "completed",
            paidAt: new Date(),
          })
          .where(eq(payments.id, payment.id));

        // Update order
        await db
          .update(orders)
          .set({ status: "paid" })
          .where(eq(orders.id, payment.orderId));

        // Clear user's cart
        const [cart] = await dbRead
          .select({ id: carts.id })
          .from(carts)
          .where(eq(carts.userId, session.user.id))
          .limit(1);

        if (cart) {
          await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
        }

        paymentStatus = "success";
      } else {
        await db
          .update(payments)
          .set({ status: "failed" })
          .where(eq(payments.id, payment.id));

        await db
          .update(orders)
          .set({ status: "cancelled" })
          .where(eq(orders.id, payment.orderId));

        paymentStatus = "failed";
      }
    } catch {
      paymentStatus = "pending";
    }
  } else if (status === "cancelled") {
    await db
      .update(payments)
      .set({ status: "failed" })
      .where(eq(payments.id, payment.id));

    await db
      .update(orders)
      .set({ status: "cancelled" })
      .where(eq(orders.id, payment.orderId));

    paymentStatus = "failed";
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6 font-jost text-center">
      {paymentStatus === "success" && (
        <>
          <CheckCircle2
            size={64}
            className="mx-auto text-green mb-6"
            aria-hidden
          />
          <h1 className="text-heading-3 font-medium text-dark-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-body text-dark-700 mb-8">
            Thank you for your purchase. Your order has been confirmed and
            you&apos;ll receive a confirmation email shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </>
      )}

      {paymentStatus === "failed" && (
        <>
          <XCircle
            size={64}
            className="mx-auto text-red mb-6"
            aria-hidden
          />
          <h1 className="text-heading-3 font-medium text-dark-900 mb-3">
            Payment Failed
          </h1>
          <p className="text-body text-dark-700 mb-8">
            Your payment could not be processed. Your cart items are still
            saved — please try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/checkout"
              className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 transition"
            >
              Try Again
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-dark-900 px-6 py-3 text-body-medium text-dark-900 hover:bg-dark-900 hover:text-light-100 transition"
            >
              Back to Cart
            </Link>
          </div>
        </>
      )}

      {paymentStatus === "pending" && (
        <>
          <Clock
            size={64}
            className="mx-auto text-orange mb-6"
            aria-hidden
          />
          <h1 className="text-heading-3 font-medium text-dark-900 mb-3">
            Payment Pending
          </h1>
          <p className="text-body text-dark-700 mb-8">
            Your payment is being processed. We&apos;ll update your order
            status once confirmed. You can check back later.
          </p>
          <Link
            href="/products"
            className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 transition"
          >
            Continue Shopping
          </Link>
        </>
      )}
    </div>
  );
}
