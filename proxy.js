import { NextResponse } from "next/server";

// ─── Route lists ───────────────────────────────────────────────────────────

const protectedRoutes = [
  "/me",
  "/manage-booking",
  "/checkout",
];

const publicRoutes = [
  "/login",
  "/register",
];

// ─── Core middleware logic ─────────────────────────────────────────────────

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Root redirect to locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en/in", request.url));
  }

  // 2. Token from cookie-based auth
  const token = request.cookies.get("token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // 3. Not logged in → block protected pages
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. Logged in → block login / register pages
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Next.js Edge Runtime looks for a named `middleware` export in middleware.js.
// Since this project uses proxy.js as the single middleware file, we alias it here.
export const middleware = proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
