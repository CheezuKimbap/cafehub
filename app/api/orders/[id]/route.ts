import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";

// GET single order by ID
export async function GET(req: NextRequest, context: any) {
  const { id } = context.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: {
          include: {
            variant: {
              include: { product: true }, // ensures product image & price
            },
            addons: { include: { addon: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT update order status and/or payment status
export async function PUT(req: NextRequest, context: any) {
  const { id } = context.params;

  try {
    const { status, paymentStatus } = await req.json();

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: "status or paymentStatus is required" },
        { status: 400 }
      );
    }

    if (status && !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    if (
      paymentStatus &&
      !Object.values(PaymentStatus).includes(paymentStatus)
    ) {
      return NextResponse.json(
        { error: `Invalid paymentStatus: ${paymentStatus}` },
        { status: 400 }
      );
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status ? { status: status as OrderStatus } : {}),
        ...(paymentStatus
          ? { paymentStatus: paymentStatus as PaymentStatus }
          : {}),
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            variant: { include: { product: true } },
            addons: { include: { addon: true } },
          },
        },
      },
    });

    // ---- Rewards Logic ----
    if (
      updatedOrder.status === OrderStatus.COMPLETED &&
      updatedOrder.paymentStatus === PaymentStatus.PAID
    ) {
      // Calculate stamps earned from all order items
      const stampsEarned = updatedOrder.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Atomic increment (prevents race condition)
      await prisma.customer.update({
        where: { id: updatedOrder.customerId },
        data: {
          currentStamps: {
            increment: stampsEarned,
          },
        },
      });

      // Fetch updated customer stamps AFTER increment
      const updatedCustomer = await prisma.customer.findUnique({
        where: { id: updatedOrder.customerId },
        select: { currentStamps: true },
      });

      const newStampCount = updatedCustomer?.currentStamps ?? 0;

      // ---- Loyalty Program Lookup ----
      const program = await prisma.loyaltyProgram.findFirst({
        where: { name: "Coffeessential Stamp" },
        include: { rewardTiers: true },
      });

      if (program) {
        // Check if new stamp total matches a tier
        const matchedTier = program.rewardTiers.find(
          (tier) => tier.stampNumber === newStampCount
        );

        if (matchedTier) {
          // Issue the reward
          await prisma.discount.create({
            data: {
              customerId: updatedOrder.customerId,
              type: matchedTier.rewardType,
              description: matchedTier.rewardDescription || "Reward Earned",
              discountAmount: matchedTier.discountAmount ?? null,
              productId: null,
            },
          });

          // Determine the highest tier safely
          const highestTier =
            program.rewardTiers.length > 0
              ? Math.max(
                  ...program.rewardTiers.map((t) => t.stampNumber)
                )
              : 0;

          // Reset stamps if customer hit max tier
          if (matchedTier.stampNumber === highestTier) {
            await prisma.customer.update({
              where: { id: updatedOrder.customerId },
              data: { currentStamps: 0 },
            });
          }
        }
      }
    }

    return NextResponse.json(
      { message: "Order updated", order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// DELETE (soft delete) order
export async function DELETE(req: NextRequest, context: any) {
  const { id } = context.params;

  try {
    const deletedOrder = await prisma.order.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: "Order deleted", order: deletedOrder },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
