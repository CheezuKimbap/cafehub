// middleware.ts
import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextRequest } from "next/server"

// export the built-in middleware
const { auth } = NextAuth(authConfig)
export default auth(async function middleware(req) {  
    if (!req.auth && req.nextUrl.pathname !== "/signin") {
    const newUrl = new URL("/signin", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})
// Optional: restrict which routes it applies to
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"], // protect only these
}
