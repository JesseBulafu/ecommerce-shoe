import { NextRequest } from "next/server";
import { verifyWebhookHash, verifyTransaction } from "@/lib/flutterwave";
import { db } from "@/db";
import { payments, orders } from "@/db/schema/orders";
import { carts, cartItems } from "@/db/schema/carts";
import { eq } from "drizzle-orm";

/**
 * Flutterwave webhook handler.
 *
 * Flutterwave sends a POST request here after a payment event.
 * We verify the hash, then verify the transaction, and update
 * the order/payment status accordingly.
 */
export async function POST(request: NextRequest) {
  const hash = request.headers.get("verif-hash");

  if (!verifyWebhookHash(hash)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const event = body?.event;

  if (event !== "charge.completed") {
    return Response.json({ status: "ignored" });
  }

  const txRef = body?.data?.tx_ref as string | undefined;
  const transactionId = String(body?.data?.id ?? "");

  if (!txRef || !transactionId) {
    return Response.json({ error: "Missing tx_ref or id" }, { status: 400 });
  }

  // Verify the transaction directly with Flutterwave
  try {
    const verification = await verifyTransaction(transactionId);
    const isSuccessful =
      verification.status === "success" &&
      verification.data.status === "successful" &&
      verification.data.tx_ref === txRef;

    // Look up our payment record by tx_ref
    const [payment] = await db
      .select({ id: payments.id, orderId: payments.orderId })
      .from(payments)
      .where(eq(payments.transactionId, txRef))
      .limit(1);

    if (!payment) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    if (isSuccessful) {
      // Mark payment completed
      await db
        .update(payments)
        .set({
          status: "completed",
          paidAt: new Date(),
          transactionId: txRef,
        })
        .where(eq(payments.id, payment.id));

      // Mark order as paid
      await db
        .update(orders)
        .set({ status: "paid" })
        .where(eq(orders.id, payment.orderId));

      // Clear the user's cart
      const [order] = await db
        .select({ userId: orders.userId })
        .from(orders)
        .where(eq(orders.id, payment.orderId))
        .limit(1);

      if (order) {
        const [cart] = await db
          .select({ id: carts.id })
          .from(carts)
          .where(eq(carts.userId, order.userId))
          .limit(1);

        if (cart) {
          await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
        }
      }
    } else {
      // Mark payment as failed
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.id, payment.id));

      await db
        .update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.id, payment.orderId));
    }

    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
