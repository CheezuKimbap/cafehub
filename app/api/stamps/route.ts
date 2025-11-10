import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust import path

export async function PUT(req: NextRequest) {
  try {
    // Read customerId and stamps from body
    const { id, stamps = 1 } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Customer id is required" },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { currentStamps: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Add stamps
    let newStampCount = (customer.currentStamps || 0) + stamps;

    await prisma.customer.update({
      where: { id },
      data: { currentStamps: newStampCount },
    });

    // Rewards logic
    if (newStampCount >= 12) {
      // Reset stamps
      await prisma.customer.update({
        where: { id },
        data: { currentStamps: 0 },
      });

      await prisma.discount.create({
        data: {
          customerId: id,
          type: "FREE_ITEM",
          description: "Free Drink Reward",
          productId: null,
        },
      });
    } else if (newStampCount >= 6) {
      await prisma.discount.create({
        data: {
          customerId: id,
          type: "PERCENTAGE_OFF",
          description: "50% Off Reward",
          discountAmount: 50,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Stamp updated and rewards applied",
        currentStamps: newStampCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to add stamp:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
