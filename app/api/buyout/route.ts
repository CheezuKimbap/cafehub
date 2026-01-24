import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewOrder } from "@/lib/notifyNewOrder";

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: NextRequest) {
  try {
    const {
      customerId,
      variantId,
      quantity,
      addons = [], // [{ addonId, quantity }]
      discountId,
      paymentType,
      paymentProvider,
      paymentDetails,
      orderName,
      pickupTime,
    } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "CustomerId required" }, { status: 400 });
    }
    if (!variantId) {
      return NextResponse.json({ error: "VariantId required" }, { status: 400 });
    }

    // Load variant + product
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
      },
    });

    if (!variant)
      return NextResponse.json({ error: "Invalid variantId" }, { status: 404 });

    // Load addons info
    const addonRecords = addons.length
      ? await prisma.addon.findMany({
          where: { id: { in: addons.map((x: any) => x.addonId) } },
        })
      : [];

    let basePrice = variant.price * quantity;
    let addonsTotal = addons.reduce((sum: number, ad: any) => {
      const addon = addonRecords.find((x) => x.id === ad.addonId);
      if (!addon) return sum;
      return sum + addon.price * ad.quantity;
    }, 0);

    let totalAmount = basePrice + addonsTotal;
    let discountApplied = 0;

    // Handle discount (optional)
    if (discountId) {
      const discount = await prisma.discount.findUnique({
        where: { id: discountId },
      });

      if (!discount)
        return NextResponse.json({ error: "Invalid discount" }, { status: 404 });

      if (discount.isRedeemed)
        return NextResponse.json(
          { error: "Discount already redeemed" },
          { status: 400 },
        );

      // % OFF — single item
      if (discount.type === "PERCENTAGE_OFF" && discount.discountAmount) {
        const oneUnitPrice =
          variant.price +
          addonsTotal / quantity; // distribute addons per unit

        discountApplied = Math.floor(
          (oneUnitPrice * discount.discountAmount) / 100,
        );
        totalAmount -= discountApplied;
      }

      // FREE ITEM
      if (discount.type === "FREE_ITEM") {
        const oneUnitPrice = variant.price + addonsTotal;
        discountApplied = oneUnitPrice;
        totalAmount -= discountApplied;
      }

      if (totalAmount < 0) totalAmount = 0;

      await prisma.discount.update({
        where: { id: discount.id },
        data: { isRedeemed: true, usedAt: new Date() },
      });
    }

    // Generate order number for the day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysOrders = await prisma.order.count({
      where: { orderDate: { gte: startOfDay } },
    });

    const orderNumber = `CH-${String(todaysOrders + 1).padStart(4, "0")}`;

    // Create Order + Payment + Items
    const order = await prisma.order.create({
      data: {
        customerId,
        orderDate: new Date(),
        orderNumber,
        totalAmount,
        discountApplied,
        orderName: orderName ?? null,
        pickupTime: pickupTime ? new Date(pickupTime) : new Date(),
        orderItems: {
          create: {
            variantId,
            quantity: quantity ?? 1,
            priceAtPurchase: variant.price,
            addons: {
              create: addons.map((a: any) => ({
                addonId: a.addonId,
                quantity: a.quantity,
              })),
            },
          },
        },
      },
      include: {
        orderItems: {
          include: { addons: true, variant: { include: { product: true } } },
        },
      },
    });

    await notifyNewOrder(order.orderNumber);

    // Insert Payment
    let paymentMethod = null;
    if (paymentType) {
      paymentMethod = await prisma.paymentMethod.create({
        data: {
          orderId: order.id,
          type: paymentType,
          provider: null,
          details: paymentDetails,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({
      message: "Buyout order created",
      orderId: order.id,
      totalAmount: order.totalAmount,
      discountApplied,
      paymentMethod,
    });
  } catch (err: any) {
    console.error("Buyout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
