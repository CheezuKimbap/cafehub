import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const { customerId, discountCode, paymentType, paymentProvider, paymentDetails } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "CustomerId required" }, { status: 400 });
    }

    // 1. Find active cart
    const cart = await prisma.cart.findFirst({
      where: { customerId, status: "ACTIVE", isDeleted: false },
      include: { items: { where: { isDeleted: false } } },
    });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "No active cart or cart is empty" }, { status: 404 });
    }

    // 2. Calculate total
    let totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    // 3. Apply discount
     let discountApplied = 0;
    // if (discountCode) {
    //   const voucher = await prisma.discount.findUnique({ where: { code: discountCode } });
    //   if (voucher && voucher.isActive) {
    //     discountApplied = voucher.amount; // or % calculation if you store it
    //     totalAmount -= discountApplied;
    //   }
    // }

    // 4. Transaction → Create Order + Payment + Close Cart
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          customerId,
          orderDate: new Date(),
          totalAmount,
          discountApplied,
          orderItems: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              servingType: item.servingType,
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

    // 5. Optionally create PaymentMethod immediately
    let paymentMethod = null;
    if (paymentType && paymentProvider) {
      paymentMethod = await prisma.paymentMethod.create({
        data: {
          orderId: order.id,
          type: paymentType,
          provider: paymentProvider,
          details: paymentDetails,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({
      message: "Checkout complete",
      orderId: order.id,
      totalAmount: order.totalAmount,
      discountApplied,
      paymentMethod,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
