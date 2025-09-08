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
  
  if (pathname.startsWith("/admin") && role === "CUSTOMER") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect unauthenticated users away from /admin
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (pathname.startsWith("/barista") && !token) {
    return NextResponse.redirect(new URL("/barista/login", req.url));
  }
    return NextResponse.next();
},
)
// Optional: restrict which routes it applies to
export const config = {
 matcher: ["/admin/:path((?!login).*)"], // all /admin routes/ protect only these
}
