import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust import path

export async function PUT(req: NextRequest) {
  try {
    const { id, stamps = 1 } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Customer id is required" },
        { status: 400 }
      );
    }

    // Fetch current stamps
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { currentStamps: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Increment stamps atomically
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        currentStamps: {
          increment: stamps,
        },
      },
      select: { currentStamps: true },
    });

    const newStampCount = updatedCustomer.currentStamps;

    // ---- Dynamic Loyalty Program ----
    const program = await prisma.loyaltyProgram.findFirst({
      where: { name: "Coffeessential Stamp" },
      include: { rewardTiers: true },
    });

    if (program) {
      // Check if the customer hits a reward tier
      const matchedTier = program.rewardTiers.find(
        (tier) => tier.stampNumber === newStampCount
      );

      if (matchedTier) {
        // Issue the reward
        await prisma.discount.create({
          data: {
            customerId: id,
            type: matchedTier.rewardType,
            description: matchedTier.rewardDescription || "Reward Earned",
            discountAmount: matchedTier.discountAmount ?? null,
            productId: null,
          },
        });

        // Determine the highest tier
        const highestTier =
          program.rewardTiers.length > 0
            ? Math.max(...program.rewardTiers.map((t) => t.stampNumber))
            : 0;

        // Reset stamps if max tier is reached
        if (matchedTier.stampNumber === highestTier) {
          await prisma.customer.update({
            where: { id },
            data: { currentStamps: 0 },
          });
        }
      }
    }

    return NextResponse.json(
      {
        message: "Stamp updated and rewards applied",
        currentStamps: newStampCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to add stamp:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

