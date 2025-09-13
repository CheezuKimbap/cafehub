// middleware.ts
import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextRequest, NextResponse } from "next/server"


// export the built-in middleware
const { auth } = NextAuth(authConfig)
export default auth(async function middleware(req) {  
  const role = req.auth?.user?.role
  const token = req.auth
  const { pathname } = req.nextUrl;
   // --- Role-based route restrictions ---

    if (pathname === "/admin/login" || pathname === "/barista/login" || pathname === "/login") {
    return NextResponse.next()
  }
 
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  
  if (pathname.startsWith("/barista")) {
    if (!token) {
      return NextResponse.redirect(new URL("/barista/login", req.url))
    }
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

 
  if (role === "BARISTA" && !pathname.startsWith("/barista")) {
    return NextResponse.redirect(new URL("/barista", req.url))
  }

  if (role === "ADMIN" && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }
    return NextResponse.next();
},
)
// // Optional: restrict which routes it applies to
// export const config = {
//  matcher: ["/admin/:path((?!login).*)","/barista/:path((?!login).*)"], // all /admin routes/ protect only these
// }

export const config = {
  matcher: [
    "/",
    "/((?!_next|api|favicon.ico).*)",  // catch-all except Next.js internals
  ],
}