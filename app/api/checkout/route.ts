import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

// Helper: pick random element from array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: NextRequest) {
  try {
    const { customerId, discountId, paymentType, paymentProvider, paymentDetails } =
      await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "CustomerId required" }, { status: 400 });
    }

    // 1. Find active cart
    const cart = await prisma.cart.findFirst({
      where: { customerId, status: "ACTIVE", isDeleted: false },
      include: {
        items: {
          where: { isDeleted: false },
          include: { addons: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "No active cart or cart is empty" }, { status: 404 });
    }

    // 2. Calculate total (base)
    let totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    // 3. Apply discount
    let discountApplied = 0;

    if (discountId) {
      const discount = await prisma.discount.findUnique({
        where: { id: discountId },
      });

      if (!discount) {
        return NextResponse.json({ error: "Invalid discount" }, { status: 404 });
      }

      if (discount.isRedeemed) {
        return NextResponse.json({ error: "Discount already redeemed" }, { status: 400 });
      }

      // --- CASE 1: Percentage off ONE drink
      if (discount.type === "PERCENTAGE_OFF" && discount.discountAmount) {
        const targetItem = getRandomItem(cart.items);

        // Apply discount to one unit only
        const oneUnitPrice = targetItem.price / targetItem.quantity;
        discountApplied = Math.floor((oneUnitPrice * discount.discountAmount) / 100);

        totalAmount -= discountApplied;
      }

      // --- CASE 2: Free ONE drink
      if (discount.type === "FREE_ITEM") {
        let targetItem = null;

        if (discount.productId) {
          // Specific product
          targetItem = cart.items.find((item) => item.productId === discount.productId) ?? null;
        } else {
          // Random product
          targetItem = getRandomItem(cart.items);
        }

        if (targetItem) {
          const oneUnitPrice = targetItem.price / targetItem.quantity;
          discountApplied = oneUnitPrice;
          totalAmount -= discountApplied;
        }
      }

      // --- Prevent negative total
      if (totalAmount < 0) totalAmount = 0;

      // Mark discount as redeemed
      await prisma.discount.update({
        where: { id: discount.id },
        data: { isRedeemed: true, usedAt: new Date() },
      });
    }

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
              addons: {
                create: item.addons.map((addon) => ({
                  addonId: addon.addonId,
                  quantity: addon.quantity,
                })),
              },
            })),
          },
        },
        include: {
          orderItems: { include: { addons: true } },
        },
      }),

      prisma.cart.update({
        where: { id: cart.id },
        data: { status: "CHECKED_OUT" },
      }),

      prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
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
