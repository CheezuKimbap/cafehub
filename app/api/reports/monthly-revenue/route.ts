import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";

export async function GET() {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1); // Jan 1st of this year

    // Group orders by month
    const monthlyOrders = await prisma.order.groupBy({
      by: ["orderDate"],
      _sum: { totalAmount: true, discountApplied: true },
      where: {
        isDeleted: false,
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        orderDate: { gte: yearStart },
      },
      orderBy: { orderDate: "asc" },
    });

    // Initialize 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(now.getFullYear(), i, 1).toLocaleString("en-US", {
        month: "short",
      }),
      profit: 0,
      loss: 0,
    }));

    // Fill in data
    monthlyOrders.forEach((order) => {
      const monthIndex = order.orderDate.getMonth();
      const revenue = order._sum.totalAmount ?? 0;
      const discount = order._sum.discountApplied ?? 0;

      monthlyData[monthIndex].profit += revenue;
      monthlyData[monthIndex].loss += discount; // assume discount = "loss"
    });

    return NextResponse.json({ monthlyData });
  } catch (error) {
    console.error("Monthly Revenue API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly revenue" },
      { status: 500 },
    );
  }
}
