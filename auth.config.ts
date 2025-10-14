import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
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
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { customer: true },
        });
        if (!user?.password) return null;

        const isValid = await compare(
          credentials.password as string,
          user.password,
        );
        if (!isValid) return null;

        const name =
          user.role === "ADMIN"
            ? (user.name ?? "") // Admins: use user.name
            : `${user.customer?.firstName ?? ""} ${user.customer?.lastName ?? ""}`.trim(); // Customers

        return {
          id: user.id,
          email: user.email,
          name: name,
          role: user.role,
          customerId: user.customerId,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async authorized({ auth }) {
      return !!auth;
    },
  },
} satisfies NextAuthConfig;
