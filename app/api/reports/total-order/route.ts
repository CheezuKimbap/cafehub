// app/api/reports/total-order/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fixed filter: COMPLETED + PAID orders, not deleted
    const totalOrders = await prisma.order.count({
      where: {
        status: "COMPLETED",
        paymentStatus: "PAID",
        isDeleted: false,
      },
    });

    return NextResponse.json({ totalOrders });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch total orders" },
      { status: 500 },
    );
  }
}
