// src/lib/prisma.ts (or /utils/prisma.ts)
import { PrismaClient } from "@/prisma/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only needed if you want to override
    // datasources: { db: { url: process.env.DATABASE_URL! } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
