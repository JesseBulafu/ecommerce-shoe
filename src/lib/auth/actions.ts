"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, lt, and, count, asc, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { guest, user } from "@/db/schema";
import { carts, cartItems } from "@/db/schema/carts";
import { signUpSchema, signInSchema } from "./validation";
import crypto from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const GUEST_COOKIE_NAME = "guest_session";
const GUEST_SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password } = parsed.data;

  const res = await auth.api.signUpEmail({
    body: { name, email, password },
    headers: await headers(),
  });

  if (!res || !res.user) {
    return { success: false, error: "Sign up failed. Email may already be in use." };
  }

  // Auto-promote to admin if this is the very first user (no admins exist yet)
  const [adminCount] = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.role, "admin"));

  if (adminCount.count === 0) {
    await db
      .update(user)
      .set({
        role: "admin",
        adminKey: crypto.randomUUID(),
        updatedAt: new Date(),
      })
      .where(eq(user.id, res.user.id));
  }

  // Merge guest cart then clean up guest session
  await mergeGuestCartWithUserCart(res.user.id);

  redirect("/");
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = parsed.data;

  try {
    const res = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    if (!res || !res.user) {
      return { success: false, error: "Invalid email or password." };
    }

    // Auto-promote to admin if no admins exist yet
    // (handles first user who signed up before this code was added)
    const [adminCount] = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, "admin"));

    if (adminCount.count === 0) {
      // Promote the earliest registered user (the true "first" user)
      const [firstUser] = await db
        .select({ id: user.id })
        .from(user)
        .where(isNull(user.deletedAt))
        .orderBy(asc(user.createdAt))
        .limit(1);

      if (firstUser) {
        await db
          .update(user)
          .set({
            role: "admin",
            adminKey: crypto.randomUUID(),
            updatedAt: new Date(),
          })
          .where(eq(user.id, firstUser.id));
      }
    }

    // Merge guest cart then clean up guest session
    await mergeGuestCartWithUserCart(res.user.id);
  } catch {
    return { success: false, error: "Invalid email or password." };
  }

  redirect("/");
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}

// ─── Get Session ──────────────────────────────────────────────────────────────

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

// ─── Guest Session Management ─────────────────────────────────────────────────

/**
 * Retrieves the current guest session from the cookie and DB.
 * Returns null if no guest session exists or if it's expired.
 */
export async function guestSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_COOKIE_NAME)?.value;

  if (!token) return null;

  const [guestRecord] = await db
    .select()
    .from(guest)
    .where(eq(guest.sessionToken, token))
    .limit(1);

  if (!guestRecord || guestRecord.expiresAt < new Date()) {
    // Expired or not found — clean up
    if (guestRecord) {
      await db.delete(guest).where(eq(guest.id, guestRecord.id));
    }
    cookieStore.delete(GUEST_COOKIE_NAME);
    return null;
  }

  return guestRecord;
}

/**
 * Creates a new guest session with a UUID token, stores it in the DB,
 * and sets an HttpOnly cookie. Returns the guest record.
 */
export async function createGuestSession() {
  // Check for existing valid guest session first
  const existing = await guestSession();
  if (existing) return existing;

  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + GUEST_SESSION_MAX_AGE * 1000);

  const [guestRecord] = await db
    .insert(guest)
    .values({ sessionToken, expiresAt })
    .returning();

  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: GUEST_SESSION_MAX_AGE,
  });

  return guestRecord;
}

// ─── Guest-to-User Cart Migration ─────────────────────────────────────────────

/**
 * Migrates guest cart data to the authenticated user's cart.
 * Called on successful sign-in or sign-up.
 *
 * NOTE: Cart tables are not yet implemented. This function provides
 * the hook point for cart migration. Once cart schema is added,
 * fill in the migration logic here.
 */
export async function mergeGuestCartWithUserCart(
  _userId: string,
): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_COOKIE_NAME)?.value;

  if (!token) return;

  const [guestRecord] = await db
    .select()
    .from(guest)
    .where(eq(guest.sessionToken, token))
    .limit(1);

  if (!guestRecord) {
    cookieStore.delete(GUEST_COOKIE_NAME);
    return;
  }

  // ── Find guest cart ────────────────────────────────────────────────────
  const [guestCart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.guestId, guestRecord.id))
    .limit(1);

  if (guestCart) {
    // ── Find or create the user's cart ──────────────────────────────────
    let [userCart] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, _userId))
      .limit(1);

    if (!userCart) {
      [userCart] = await db
        .insert(carts)
        .values({ userId: _userId })
        .returning({ id: carts.id });
    }

    // ── Merge items: add quantities for existing variants, insert new ones
    const guestItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, guestCart.id));

    for (const item of guestItems) {
      const [existing] = await db
        .select({ id: cartItems.id, quantity: cartItems.quantity })
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, userCart.id),
            eq(cartItems.productVariantId, item.productVariantId),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(cartItems)
          .set({ quantity: existing.quantity + item.quantity })
          .where(eq(cartItems.id, existing.id));
      } else {
        await db.insert(cartItems).values({
          cartId:           userCart.id,
          productVariantId: item.productVariantId,
          quantity:         item.quantity,
        });
      }
    }

    // ── Delete guest cart (cascades to its cart_items) ──────────────────
    await db.delete(carts).where(eq(carts.id, guestCart.id));
  }

  // Clean up: remove guest record and cookie
  await db.delete(guest).where(eq(guest.id, guestRecord.id));
  cookieStore.delete(GUEST_COOKIE_NAME);
}

// ─── Clean Up Expired Guest Sessions (utility) ───────────────────────────────

export async function cleanupExpiredGuestSessions(): Promise<number> {
  const result = await db
    .delete(guest)
    .where(lt(guest.expiresAt, new Date()))
    .returning();

  return result.length;
}
