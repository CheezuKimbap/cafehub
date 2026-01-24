import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";

export async function GET() {
  try {
    // TOTAL COMPLETED + PAID ORDERS
    const totalOrders = await prisma.order.count({
      where: {
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
      },
    });

    // TOTAL FREE DRINK REDEEMS
    const freeDrinksRedeemed = await prisma.discount.count({
      where: {
        type: "FREE_ITEM",
        isRedeemed: true,
      },
    });

    return NextResponse.json({
      totalOrders,
      freeDrinksRedeemed,
    });
  } catch (error) {
    console.error("Metrics API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
