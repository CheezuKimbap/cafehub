import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/prisma/generated/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

// GET: Fetch all non-deleted orders with items + customer
export async function GET(req: NextRequest) {
  const authError = validateApiKey(req)
    if (authError) return authError  
  try {
    const orders = await prisma.order.findMany({
      where: { isDeleted: false },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
      },
    });

    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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