// /src/app/api/reports/revenue/route.ts
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";
// /src/app/api/reports/revenue/route.ts
export async function GET(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const dateParam: string | undefined = body.date; // format: YYYY-MM-DD

    let targetDate: Date;

    if (dateParam) {
      // Validate format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return NextResponse.json(
          { error: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }
      targetDate = new Date(dateParam);
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date" },
          { status: 400 }
        );
      }
    } else {
      targetDate = new Date(); // default to today
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const revenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        orderDate: { gte: startOfDay, lte: endOfDay },
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
      },
    });

    return NextResponse.json({ revenue: revenue._sum.totalAmount ?? 0 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch revenue" },
      { status: 500 }
    );
  }
}
