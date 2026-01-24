import { prisma } from "@/lib/prisma";

export async function notifyNewOrder(orderNumber: string) {
  await prisma.notification.create({
  data: {
    message: `New order #${orderNumber}`,
    dateSent: new Date(),
    customerId: null, // 👈 REQUIRED
  },
});

}
