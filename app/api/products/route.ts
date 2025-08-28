import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET(request: NextRequest) {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}


export async function POST(req: NextRequest) {
  try {
    const { customerId, totalAmount, discountApplied, orderItems } = await req.json();

    // Basic validation
    if (!customerId || !totalAmount || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // Check customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 400 });
    }

    // Check all products exist
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
    }

    // Create order with nested order items
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



export async function PUT(req: NextRequest) {
  const { id, name, description, price } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { name, description, price },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted successfully" });
}