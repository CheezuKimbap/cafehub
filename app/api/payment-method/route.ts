import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

// -------------------------
// POST: Create Payment Method
// -------------------------
export async function POST(req: NextRequest) {
  const authError = validateApiKey(req)
  if (authError) return authError  
  try {
    const { orderId, type, provider, details, status } = await req.json();

    if (!orderId || !type || !status) {
      return NextResponse.json(
        { error: "orderId, type, and status are required" },
        { status: 400 }
      );
    }

    // Check order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId, isDeleted: false },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Enforce 1:1 relationship
    const existingPayment = await prisma.paymentMethod.findUnique({
      where: { orderId },
    });
    if (existingPayment) {
      return NextResponse.json(
        { error: "Payment method already exists for this order" },
        { status: 400 }
      );
    }

    const payment = await prisma.paymentMethod.create({
      data: {
        orderId,
        type,
        provider,
        details,
        status,
        paidAt: status === "SUCCESS" ? new Date() : null,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------------------------
// PUT: Update Payment Method (by orderId)
// -------------------------
export async function PUT(req: NextRequest) {
  try {
    const { orderId, type, provider, details, status } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const payment = await prisma.paymentMethod.update({
      where: { orderId },
      data: {
        type,
        provider,
        details,
        status,
        paidAt: status === "SUCCESS" ? new Date() : null,
      },
    });

    return NextResponse.json(payment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------------------------
// DELETE: Soft Delete Payment Method (by orderId)
// -------------------------
export async function DELETE(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const payment = await prisma.paymentMethod.update({
      where: { orderId },
      data: {
        deletedAt: new Date(),
        deletedBy: "system", // replace with req.user.id if authenticated
      },
    });

    return NextResponse.json({
      message: "Payment method soft-deleted",
      payment,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
