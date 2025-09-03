import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const { customerId, discountApplied = 0 } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "CustomerId required" },
        { status: 400 }
      );
    }

    // Find active cart with items
    const cart = await prisma.cart.findFirst({
      where: { customerId, status: "ACTIVE", isDeleted: false },
      include: { items: { where: { isDeleted: false } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "No active cart or cart is empty" },
        { status: 404 }
      );
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Run as a transaction to keep cart + order consistent
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          customerId,
          orderDate: new Date(),
          totalAmount: totalAmount - discountApplied,
          discountApplied,
          orderItems: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.price,
            })),
          },
        },
        include: { orderItems: true },
      }),

      prisma.cart.update({
        where: { id: cart.id },
        data: { status: "CHECKED_OUT" },
      }),
    ]);

    return NextResponse.json({
      message: "Checkout complete",
      orderId: order.id,
      totalAmount: order.totalAmount,
      order,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to checkout" }, { status: 500 });
  }
}
