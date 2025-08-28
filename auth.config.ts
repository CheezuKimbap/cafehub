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
    signIn: '/signin',
    newUser: '/' // Redirect new users to the home page
  },
  callbacks:{
    async jwt({token, user}){

      if(user){
        token.role = user.role
      }
      return token
    },
     async session({ session, token }) {
      // ✅ MUST return session, not void
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "CUSTOMER" | "ADMIN" | "STAFF"
        session.user.customerId = token.customerId as string | null
      }
      return session
    },
    async authorized({auth}){
       return !!auth 
    },
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