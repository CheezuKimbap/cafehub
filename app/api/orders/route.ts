import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/prisma/generated/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

// GET: Fetch orders for a customer (or all if customerId not provided)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");

    const whereCondition: any = { isDeleted: false };
    if (customerId) whereCondition.customerId = customerId;

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
         customer: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
        },
        orderItems: {
          include: {
            variant: {
              include: {
                product: true, // product details like image, name, etc.
              },
            },
            addons: {
              include: { addon: true }, // addon details
            },
          },
        },
        paymentMethod: true,
      },
      orderBy: { orderDate: "desc" },
    });

    if (!orders || orders.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT: Update order status
export async function PUT(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const { customerId, status } = await req.json();

    if (!customerId || !status) {
      return NextResponse.json(
        { error: "customerId and status are required" },
        { status: 400 },
      );
    }

    if (!(Object.values(OrderStatus) as string[]).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 },
      );
    }

    // Update the latest active order (optional: instead of all)
    const latestOrder = await prisma.order.findFirst({
      where: { customerId, isDeleted: false },
      orderBy: { orderDate: "desc" },
    });

    if (!latestOrder) {
      return NextResponse.json(
        { error: "No active order found for this customer" },
        { status: 404 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: latestOrder.id },
      data: { status: status as OrderStatus },
    });

    return NextResponse.json({
      message: `Updated order ${updatedOrder.id} to status ${status}`,
    });
  } catch (err: any) {
    console.error("Failed to update order:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
