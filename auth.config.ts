import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./app/lib/prisma"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcrypt"
export default {
  providers: [
    Google,
    GitHub,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    async authorize(credentials) {
    const { email, password } = credentials as { email: string; password: string }

    if (!email || !password) return null

    const user = await prisma.user.findUnique({
      where: { email },
      include: { customer: true },
    })
    if (!user?.customer?.password) return null   

    const isValid = await compare(credentials.password as string, user.customer.password)
    if (!isValid) return null
    return {
      id: user.id,
      email: user.email,
      name: `${user.customer?.firstName ?? ""} ${user.customer?.lastName ?? ""}`.trim(),
      role: user.role,
      customerId: user.customerId,
    }
  }
  ,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: '/signin',
    newUser: '/' // Redirect new users to home
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.customerId = user.customerId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "CUSTOMER" | "ADMIN" | "STAFF"
        session.user.customerId = token.customerId as string | null
      }
      return session
    },
    async authorized({ auth }) {
      return !!auth
    },
  },
  events: {
    async createUser({ user }) {
      // split into first + last
      const [firstName = "Customer", ...lastParts] = (user.name || "Customer").split(" ")
      const lastName = lastParts.join(" ") || null

      // ensure customer exists
      let customer = await prisma.customer.findUnique({
        where: { email: user.email! },
      })

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            email: user.email!,
            firstName,
            lastName,
          },
        })
      }

      // now safely update user → guaranteed to exist at this point
      await prisma.user.update({
        where: { id: user.id },
        data: { customerId: customer.id },
      })
    }
  }
} satisfies NextAuthConfig
