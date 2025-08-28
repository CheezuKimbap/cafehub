import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "CUSTOMER" | "ADMIN" | "STAFF"
      customerId?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "CUSTOMER" | "ADMIN" | "STAFF"
    customerId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "CUSTOMER" | "ADMIN" | "STAFF"
    customerId?: string | null
  }
}
