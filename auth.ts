import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.customerId = user.customerId
      } else if (!token.customerId && token.email) {
        if (token.role === "CUSTOMER") {
          // Database logic allowed here
          let customer = await prisma.customer.findUnique({ where: { email: token.email } })
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                email: token.email,
                firstName: "Customer",
              },
            })
          }
          await prisma.user.updateMany({
            where: { email: token.email, customerId: null },
            data: { customerId: customer.id },
          })
          token.customerId = customer.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "CUSTOMER" | "ADMIN" | "BARISTA"
        session.user.customerId = token.customerId as string | null
      }
      return session
    },
  },
})