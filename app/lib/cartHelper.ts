// app/lib/cartHelpers.ts
import { prisma } from "@/app/lib/prisma"; // your existing Prisma client

export async function createCartsForAllCustomers() {
  const customers = await prisma.customer.findMany();

  for (const customer of customers) {
    const existingCart = await prisma.cart.findFirst({
      where: { customerId: customer.id, isDeleted: false },
    });

    if (!existingCart) {
      await prisma.cart.create({
        data: {
          customerId: customer.id,
          status: "ACTIVE",
        },
      });
    }
  }

  return { message: "All customers now have a cart." };
}
