import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/loyalty-reward-tiers
export async function GET() {
  try {
    const tiers = await prisma.loyaltyRewardTier.findMany({
      orderBy: { stampNumber: "asc" }, // optional, sort by stamp number
    });
    return NextResponse.json(tiers);
  } catch (err) {
    console.error("Error fetching loyalty reward tiers:", err);
    return NextResponse.json(
      { error: "Failed to fetch tiers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.stampNumber || !body.rewardType || !body.rewardDescription) {
      return NextResponse.json(
        { error: "stampNumber, rewardType, and rewardDescription are required" },
        { status: 400 }
      );
    }

    const created = await prisma.loyaltyRewardTier.create({
      data: {
        programId: body.programId ?? "", // optional if you have a single program
        stampNumber: body.stampNumber,
        rewardType: body.rewardType,
        rewardDescription: body.rewardDescription,
        discountAmount: body.discountAmount ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Error creating loyalty reward tier:", err);
    return NextResponse.json({ error: "Failed to create tier" }, { status: 500 });
  }
}
