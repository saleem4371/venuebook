import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // redirect root to default locale + country
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en/in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico).*)",
  ],
};
