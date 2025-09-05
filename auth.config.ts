import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
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
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
   async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.customerId = user.customerId;
      } else if (!token.customerId && token.email) {
        // Ensure customer exists for OAuth logins
        let customer = await prisma.customer.findUnique({ where: { email: token.email } });
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              email: token.email!,
              firstName: "Customer",
            },
          });
        }
        // Link the user record to the customer if not linked
        await prisma.user.updateMany({
          where: { email: token.email, customerId: null },
          data: { customerId: customer.id },
        });
        token.customerId = customer.id;
      }
      return token;
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
    }
  }
} satisfies NextAuthConfig
