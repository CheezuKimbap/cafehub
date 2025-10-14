import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user }) {
      if (user) {
        // Always load the user from DB
        let dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { customer: true },
        });

        // Only auto-create customer if missing + role is CUSTOMER
        if (user.role === "CUSTOMER" && !dbUser?.customerId) {
          const customer = await prisma.customer.create({
            data: {
              email: user.email!,
              firstName: user.name ?? "",
            },
          });

          dbUser = await prisma.user.update({
            where: { id: user.id },
            data: { customerId: customer.id },
            include: { customer: true },
          });
        }

        // Always set core fields on the token
        token.id = dbUser?.id ?? user.id;
        token.role = dbUser?.role ?? user.role;
        token.customerId = dbUser?.customerId ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN" | "BARISTA";
        session.user.customerId = token.customerId as string | null;
      }
      return session;
    },
  },
});
