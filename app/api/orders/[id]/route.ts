import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

// GET single order by ID
export async function GET(req: NextRequest, context: any) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = await  context.params as { id: string };

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT update order status
// PUT update order status (and payment status)
export async function PUT(req: NextRequest, context: any) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = context.params as { id: string };

  try {
    const body = await req.json();
    const { status, paymentStatus } = body;

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: "status or paymentStatus is required" },
        { status: 400 }
      );
    }

    // Validate order status if provided
    if (status && !(Object.values(OrderStatus) as string[]).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    // Validate payment status if provided
    // assuming you have PaymentStatus enum in Prisma
    if (
      paymentStatus &&
      !(Object.values(PaymentStatus) as string[]).includes(paymentStatus)
    ) {
      return NextResponse.json(
        { error: `Invalid paymentStatus: ${paymentStatus}` },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status ? { status: status as OrderStatus } : {}),
        ...(paymentStatus ? { paymentStatus: paymentStatus as PaymentStatus } : {}),
      },
    });

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


// DELETE order (soft delete)
export async function DELETE(req: NextRequest, context: any) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = context.params as { id: string };

  try {
    const deletedOrder = await prisma.order.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Order deleted", order: deletedOrder }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
