import { auth } from "@/auth";
import { NextResponse } from "next/server";

const ignoredPaths = ["/", "/menu", "/login", "/admin/login", "/barista/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const token = req.auth;

  // Allow public pages
  if (ignoredPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Admin area
  if (pathname.startsWith("/admin")) {
    if (!token || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // Barista area
  if (pathname.startsWith("/barista")) {
    if (!token || role !== "BARISTA") {
      return NextResponse.redirect(new URL("/barista/login", req.url));
    }
    return NextResponse.next();
  }

  // For any other path (like `/` or public pages)
  // Restrict admins and baristas
  if (role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (role === "BARISTA") {
    return NextResponse.redirect(new URL("/barista", req.url));
  }

  // CUSTOMER or unauthenticated users can access `/` or other pages
  return NextResponse.next()

});
// // Optional: restrict which routes it applies to
// export const config = {
//  matcher: ["/admin/:path((?!login).*)","/barista/:path((?!login).*)"], // all /admin routes/ protect only these
// }

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:png|svg|jpg|jpeg|gif|webp)$|favicon.ico).*)",
  ],
};
