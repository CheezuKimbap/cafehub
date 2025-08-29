import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { customerId, discountApplied } = await req.json();

    if (!customerId) return NextResponse.json({ error: "CustomerId required" }, { status: 400 });

    // Find active cart with items
    const cart = await prisma.cart.findFirst({
      where: { customerId, status: "ACTIVE", isDeleted: false },
      include: { items: { where: { isDeleted: false } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "No active cart or cart is empty" }, { status: 404 });
    }

    // Compute total amount
    const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order with nested items
    const order = await prisma.order.create({
      data: {
        customerId,
        orderDate: new Date(),
        totalAmount,
        discountApplied,
        orderItems: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    // Mark cart as checked out
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: "CHECKED_OUT" },
    });

    return NextResponse.json({ message: "Checkout complete", order });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to checkout" }, { status: 500 });
  }
}
