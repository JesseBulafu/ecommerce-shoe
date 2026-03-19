import { redirect } from "next/navigation";
import { getSession } from "./actions";

/**
 * Require authentication for a page or server component.
 * Redirects to sign-in with a callback URL if not authenticated.
 */
export async function requireAuth(callbackUrl = "/") {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

/**
 * Redirect away from auth pages if already authenticated.
 */
export async function redirectIfAuthenticated(to = "/") {
  const session = await getSession();
  if (session?.user) {
    redirect(to);
  }
}
