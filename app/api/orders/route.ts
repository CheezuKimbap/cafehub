import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// GET: Fetch all non-deleted orders with items
export async function GET() {
  const orders = await prisma.order.findMany({
    where: { isDeleted: false },
    include: {
      customer: true,
      orderItems: { include: { product: true } },
    },
  });

  return NextResponse.json(orders);
}

// POST: Create order with nested items
export async function POST(req: NextRequest) {
  try {
    const { customerId, totalAmount, discountApplied, orderItems } = await req.json();

    if (!customerId || !totalAmount || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 400 });

    for (const item of orderItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        customer: { connect: { id: customerId } },
        totalAmount,
        discountApplied,
        orderDate: new Date(),
        orderItems: {
          create: orderItems.map(item => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          })),
        },
      },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}


// DELETE: Soft delete order + nested items
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

  await prisma.order.update({
    where: { id },
    data: {
      isDeleted: true,
      orderItems: {
        updateMany: {
          where: {}, // all items of this order
          data: { isDeleted: true },
        },
      },
    },
  });

  return NextResponse.json({ message: "Order soft-deleted" });
}
