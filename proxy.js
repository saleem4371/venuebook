import { NextResponse } from "next/server";

const protectedRoutes = [
  "/me",
  "/manage-booking",
  "/checkout",
];

const protectedPatterns = [
    /^\/[a-z]{2}\/[a-z]{2}\/vendor(\/.*)?$/i,
  ];

const publicRoutes = [
  "/login",
  "/register",
];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Root redirect
  if (pathname === "/") {
    const savedCountry = request.cookies.get("country")?.value;

    let country =
      savedCountry ||
      request.geo?.country ||
      request.headers.get("x-vercel-ip-country") ||
      "IN";

    country = country.toLowerCase();

    const res = NextResponse.redirect(
      new URL(`/en/${country}`, request.url)
    );

    res.cookies.set("country", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return res;
  }

  const token = request.cookies.get("token")?.value;

  const isProtectedRoute =
    protectedRoutes.some((route) => pathname === route) ||
    protectedPatterns.some((pattern) => pattern.test(pathname));

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  // Not logged in
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(
      new URL("/unauthorized", request.url)
    );
  }

  // Already logged in
  if (token && isPublicRoute) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};