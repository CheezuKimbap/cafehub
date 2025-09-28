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
      // Runs after signIn or on session refresh
        if (user && user.role === "CUSTOMER") {
        // Load user with customer relation
        let dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { customer: true },
        });

        // Only create customer if missing
        if (!dbUser?.customerId) {
          const customer = await prisma.customer.create({
            data: {
              email: user.email!,
              firstName: user.name ?? "", // one-time sync
            },
          });

          dbUser = await prisma.user.update({
            where: { id: user.id },
            data: { customerId: customer.id },
            include: { customer: true },
          });
        }

        token.id = dbUser.id
        token.role = dbUser.role
        token.customerId = dbUser.customerId
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
