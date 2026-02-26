import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Routes that don't require authentication
  const publicPaths = ["/api/auth"];
  const isPublic = publicPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (!isPublic && !req.auth) {
    const loginUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
