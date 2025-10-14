import { auth } from "@/auth";
import { NextResponse } from "next/server";

const ignoredPaths = ["/", "/menu", "/login", "/admin/login", "/barista/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const role = req.auth?.user?.role;
  const token = req.auth;

  if (ignoredPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/barista")) {
    if (!token) {
      return NextResponse.redirect(new URL("/barista/login", req.url));
    }
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (role === "BARISTA" && !pathname.startsWith("/barista")) {
    return NextResponse.redirect(new URL("/barista", req.url));
  }

  if (role === "ADMIN" && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  return NextResponse.next();
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
