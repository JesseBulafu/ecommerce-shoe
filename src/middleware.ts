import { NextRequest, NextResponse } from "next/server";

const GUEST_COOKIE_NAME = "guest_session";
const AUTH_COOKIE_NAME = "better-auth.session_token";
const GUEST_SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/** Routes that require authentication */
const PROTECTED_ROUTES = ["/checkout"];

/** Routes that authenticated users should not access */
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const guestToken = request.cookies.get(GUEST_COOKIE_NAME)?.value;
  const isAuthenticated = !!authToken;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect checkout — redirect unauthenticated users to sign-in
  if (!isAuthenticated && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Auto-create guest session cookie for unauthenticated visitors
  // (DB record is created lazily via createGuestSession() when needed)
  if (!isAuthenticated && !guestToken) {
    const token = crypto.randomUUID();
    response.cookies.set(GUEST_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: GUEST_SESSION_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder assets
     * - API auth routes (Better Auth handles these)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|images/|api/auth|api/payment/webhook).*)",
  ],
};
