import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect all /dashboard for BUSINESS users
  if (pathname.startsWith("/dashboard")) {
    // not logged in or missing role
    if (!token || !("role" in token)) {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // wrong role
    if ((token as { role?: string }).role !== "BUSINESS") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Allow-list for BUSINESS: only /dashboard* and /about
  if (token && (token as { role?: string }).role === "BUSINESS") {
    const allowed =
      pathname === "/about" ||
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/");
    if (!allowed) {
      return NextResponse.redirect(new URL("/dashboard/stores", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};
