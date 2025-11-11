import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: pick random element from array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: NextRequest) {
  try {
    const {
      customerId,
      discountId,
      paymentType,
      paymentProvider,
      paymentDetails,
      orderName,
      pickupTime,
    } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "CustomerId required" },
        { status: 400 },
      );
    }

    // 1. Find active cart and include variant & addon info
    const cart = await prisma.cart.findFirst({
      where: { customerId, status: "ACTIVE", isDeleted: false },
      include: {
        items: {
          where: { isDeleted: false },
          include: {
            variant: true,
            addons: { include: { addon: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "No active cart or cart is empty" },
        { status: 404 },
      );
    }

    // 2. Calculate total (base + addons)
    let totalAmount = cart.items.reduce((sum, item) => {
      const basePrice = (item.variant?.price ?? 0) * item.quantity;
      const addonsPrice = item.addons.reduce(
        (aSum, addon) => aSum + addon.addon.price * addon.quantity,
        0,
      );
      return sum + basePrice + addonsPrice;
    }, 0);

    // 3. Apply discount
    let discountApplied = 0;
    if (discountId) {
      const discount = await prisma.discount.findUnique({
        where: { id: discountId },
      });
      if (!discount)
        return NextResponse.json(
          { error: "Invalid discount" },
          { status: 404 },
        );
      if (discount.isRedeemed)
        return NextResponse.json(
          { error: "Discount already redeemed" },
          { status: 400 },
        );

      if (discount.type === "PERCENTAGE_OFF" && discount.discountAmount) {
        const targetItem = getRandomItem(cart.items);
        const oneUnitPrice =
          (targetItem.variant?.price ?? targetItem.price) +
          targetItem.addons.reduce(
            (aSum, addon) =>
              aSum + addon.addon.price * (addon.quantity / targetItem.quantity),
            0,
          );

        discountApplied = Math.floor(
          (oneUnitPrice * discount.discountAmount) / 100,
        );
        totalAmount -= discountApplied;
      }

      if (discount.type === "FREE_ITEM") {
        const targetItem = discount.productId
          ? (cart.items.find(
              (item) => item.variant?.productId === discount.productId,
            ) ?? null)
          : getRandomItem(cart.items);

        if (targetItem) {
          const oneUnitPrice =
            (targetItem.variant?.price ?? targetItem.price) +
            targetItem.addons.reduce(
              (aSum, addon) => aSum + addon.addon.price * addon.quantity,
              0,
            );
          discountApplied = oneUnitPrice;
          totalAmount -= discountApplied;
        }
      }

      if (totalAmount < 0) totalAmount = 0;

      // Mark discount as redeemed
      await prisma.discount.update({
        where: { id: discount.id },
        data: { isRedeemed: true, usedAt: new Date() },
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Count how many orders were made today
    const todaysOrdersCount = await prisma.order.count({
      where: {
        orderDate: {
          gte: startOfDay,
        },
      },
    });

    // Increment count to get the next order number for today
    const nextSequence = todaysOrdersCount + 1;

    // Format YYYYMMDD
    const y = startOfDay.getFullYear();
    const m = String(startOfDay.getMonth() + 1).padStart(2, "0");
    const d = String(startOfDay.getDate()).padStart(2, "0");

    // Format the order number with leading zeros
    const orderNumber = `CH-${String(nextSequence).padStart(4, "0")}`;

    // 4. Transaction → create Order + close Cart + delete cartItems
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          customerId,
          orderDate: new Date(),
          orderNumber,
          totalAmount,
          discountApplied,
          orderName: orderName ?? null,
          pickupTime: pickupTime ? new Date(pickupTime) : new Date(),
          orderItems: {
            create: cart.items.map((item) => {
              if (!item.variantId || !item.variant)
                throw new Error("Cart item missing variant info");

              return {
                variantId: item.variantId,
                quantity: item.quantity,
                priceAtPurchase: item.variant.price,
                addons: {
                  create: item.addons.map((addon) => ({
                    addonId: addon.addonId,
                    quantity: addon.quantity,
                  })),
                },
              };
            }),
          },
        },
        include: {
          orderItems: {
            include: { addons: true, variant: { include: { product: true } } },
          },
        },
      }),
      prisma.cart.update({
        where: { id: cart.id },
        data: { status: "CHECKED_OUT" },
      }),
      prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
    ]);

    // 5. Optionally create PaymentMethod
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
