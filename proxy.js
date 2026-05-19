import { NextResponse } from "next/server";

// ─── Route lists ───────────────────────────────────────────────

const protectedRoutes = [
  "/me",
  "/manage-booking",
  "/checkout",
];

const publicRoutes = [
  "/login",
  "/register",
];

// ─── Core middleware ───────────────────────────────────────────

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // ─────────────────────────────────────────
  // 1. COOKIE (prevent repeated redirects)
  // ─────────────────────────────────────────
  const savedCountry = request.cookies.get("country")?.value;

  // ─────────────────────────────────────────
  // 2. ROOT → AUTO COUNTRY REDIRECT
  // ─────────────────────────────────────────
  if (pathname === "/") {
    let country = "in";

    if (savedCountry) {
      country = savedCountry;
    } else {
      country =
        request.geo?.country ||
        request.headers.get("x-vercel-ip-country") ||
        "IN";

      country = country.toLowerCase();
    }

    const res = NextResponse.redirect(
      new URL(`/en/${country}`, request.url)
    );

    // Save country in cookie
    res.cookies.set("country", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return res;
  }

  // ─────────────────────────────────────────
  // 3. AUTH TOKEN
  // ─────────────────────────────────────────
  const token = request.cookies.get("token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ─────────────────────────────────────────
  // 4. BLOCK PROTECTED ROUTES (not logged in)
  // ─────────────────────────────────────────
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ─────────────────────────────────────────
  // 5. BLOCK AUTH PAGES (already logged in)
  // ─────────────────────────────────────────
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// ─── Export alias ──────────────────────────────────────────────

export const middleware = proxy;

// ─── Matcher ───────────────────────────────────────────────────

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};