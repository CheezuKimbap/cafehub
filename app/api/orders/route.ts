import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/prisma/generated/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");

    // Build the where condition explicitly
    const whereCondition: any = { isDeleted: false };
    if (customerId) {
      whereCondition.customerId = customerId;
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        customer: true,
        orderItems: { include: { product: true } },
      },
      orderBy: { orderDate: "desc" },
    });

    if (!orders.length) {
      return NextResponse.json({ error: "No orders found" }, { status: 404 });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// PUT: Update order status (e.g., mark as PAID, SHIPPED, CANCELLED)
export async function PUT(req: NextRequest) {
  const authError = validateApiKey(req)
  if (authError) return authError  
  try {
    const { customerId, status } = await req.json();

    if (!customerId || !status) {
      return NextResponse.json(
        { error: "customerId and status are required" },
        { status: 400 }
      );
    }

    // Validate enum
    if (!(Object.values(OrderStatus) as string[]).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    // Update the latest active order for this customer
    const updatedOrder = await prisma.order.updateMany({
      where: { customerId, isDeleted: false },
      data: { status: status as OrderStatus },
    });

    if (updatedOrder.count === 0) {
      return NextResponse.json(
        { error: "No order found for this customer" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Updated ${updatedOrder.count} order(s) for customer ${customerId}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}