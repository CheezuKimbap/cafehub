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
        { status: 400 },
      );
    }

    if (status && !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 },
      );
    }

    if (
      paymentStatus &&
      !Object.values(PaymentStatus).includes(paymentStatus)
    ) {
      return NextResponse.json(
        { error: `Invalid paymentStatus: ${paymentStatus}` },
        { status: 400 },
      );
    }

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

    // Rewards logic
    if (
      updatedOrder.status === OrderStatus.COMPLETED &&
      updatedOrder.paymentStatus === PaymentStatus.PAID
    ) {
      const stampsEarned = updatedOrder.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const currentCustomer = await prisma.customer.findUnique({
        where: { id: updatedOrder.customerId },
        select: { currentStamps: true },
      });

      if (currentCustomer) {
        let newStampCount = (currentCustomer.currentStamps || 0) + stampsEarned;

        await prisma.customer.update({
          where: { id: updatedOrder.customerId },
          data: { currentStamps: newStampCount },
        });

        // Rewards
        if (newStampCount >= 12) {
          await prisma.customer.update({
            where: { id: updatedOrder.customerId },
            data: { currentStamps: 0 },
          });

          await prisma.discount.create({
            data: {
              customerId: updatedOrder.customerId,
              type: "FREE_ITEM",
              description: "Free Drink Reward",
              productId: null,
            },
          });
        } else if (newStampCount >= 6) {
          await prisma.discount.create({
            data: {
              customerId: updatedOrder.customerId,
              type: "PERCENTAGE_OFF",
              description: "50% Off Reward",
              discountAmount: 50,
            },
          });
        }
      }
    }

    return NextResponse.json(
      { message: "Order updated", order: updatedOrder },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
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
