import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/loyalty-reward-tiers/[id]
export async function GET(req: NextRequest, context: any) {
  const { id } = context.params as { id: string };

  const tier = await prisma.loyaltyRewardTier.findUnique({
    where: { id },
  });

  if (!tier) {
    return NextResponse.json({ error: "Tier not found" }, { status: 404 });
  }

  return NextResponse.json(tier);
}

// PUT /api/loyalty-reward-tiers/[id]
export async function PUT(req: NextRequest, context: any) {
  const { id } = context.params as { id: string };

  try {
    const body = await req.json();

    const updated = await prisma.loyaltyRewardTier.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE /api/loyalty-reward-tiers/[id]
export async function DELETE(req: NextRequest, context: any) {
  const { id } = context.params as { id: string };

  try {
    await prisma.loyaltyRewardTier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
