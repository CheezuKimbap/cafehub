import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";

export async function GET() {
  try {
    const today = new Date();
    const results: { day: string; value: number; itemsSold: number }[] = [];

    let totalRevenue = 0;
    let totalItemsSold = 0;

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const startOfDay = new Date(day);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      const revenue = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
        where: {
          orderDate: { gte: startOfDay, lte: endOfDay },
          status: OrderStatus.COMPLETED,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      const dayRevenue = revenue._sum.totalAmount ?? 0;
      const itemsSold = revenue._count.id ?? 0;

      totalRevenue += dayRevenue;
      totalItemsSold += itemsSold;

      const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" });
      results.push({ day: dayLabel, value: dayRevenue, itemsSold });
    }

    return NextResponse.json({
      weeklyData: results,
      totalRevenue,
      totalItemsSold,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch weekly sales" },
      { status: 500 },
    );
  }
}
