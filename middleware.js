import { NextResponse } from "next/server";

const protectedRoutes = [
  "/me",
  "/manage-booking",
  "/checkout",
];

const publicRoutes = [
  "/login",
  "/register",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 🔹 1. Root redirect to locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en/in", request.url));
  }

  // 🔹 2. Get token (cookie based auth)
  const token = request.cookies.get("token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🔒 3. If NOT logged in → block protected pages
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🔁 4. If logged in → block login/register pages
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}