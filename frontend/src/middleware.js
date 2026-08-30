import { NextResponse } from "next/server";

export function middleware(request) {
  const hasSession = request.cookies.has("accessToken");
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthPage = ["/login", "/signup"].includes(request.nextUrl.pathname);
  if (isProtected && !hasSession)
    return NextResponse.redirect(new URL("/login", request.url));
  if (isAuthPage && hasSession)
    return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
