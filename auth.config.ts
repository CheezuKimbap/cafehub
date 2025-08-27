import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"
 import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./app/lib/prisma"
// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [Google],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages:{
    signIn: 'auth/signin',
    newUser: '/' // Redirect new users to the home page
  },
  callbacks:{
    async signIn({user}){
        await prisma.customer.create({
          data: {
            name: user.name || "Customer",
            email: user.email!,
            createdAt: new Date(),
            
          },
        });
        return true
    }
  }
} satisfies NextAuthConfig