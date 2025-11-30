import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";

export async function GET(req: Request) {
  try {
    const PH_OFFSET = 8;

    const nowUTC = new Date();
    const nowPH = new Date(nowUTC.getTime() + PH_OFFSET * 60 * 60 * 1000);

    const phStart = new Date(nowPH);
    phStart.setHours(0, 0, 0, 0);

    const phEnd = new Date(nowPH);
    phEnd.setHours(23, 59, 59, 999);

    const startUTC = new Date(phStart.getTime() - PH_OFFSET * 60 * 60 * 1000);
    const endUTC = new Date(phEnd.getTime() - PH_OFFSET * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        orderDate: { gte: startUTC, lte: endUTC },
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        paymentMethod: true,
      },
    });

    let gcash = 0;
    let cash = 0;

    orders.forEach((order) => {
      const pm = order.paymentMethod;
      if (!pm) return;

      const method = pm.type.toUpperCase();

      if (method.includes("GCASH")) gcash += order.totalAmount;
      if (method.includes("CASH")) cash += order.totalAmount;
    });

    const amount = gcash + cash;

    return NextResponse.json({
      amount,  // 👈 FIXED
      gcash,
      cash,

    });
  } catch (err) {
    console.error("Revenue API Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch revenue" },
      { status: 500 }
    );
  }
}
