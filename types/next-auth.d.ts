import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      role: "CUSTOMER" | "ADMIN" | "STAFF"; // match your Prisma enum
      customerId?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: "CUSTOMER" | "ADMIN" | "STAFF";
    customerId?: string | null;
  }
}
