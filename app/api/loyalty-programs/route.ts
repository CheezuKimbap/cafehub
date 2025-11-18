import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Program name is required" },
        { status: 400 }
      );
    }

    const rewardTiers = Array.isArray(body.rewardTiers) ? body.rewardTiers : [];

    const created = await prisma.loyaltyProgram.create({
      data: {
        name: body.name,
        rewardTiers: rewardTiers.length
          ? {
              create: rewardTiers.map((tier: any) => ({
                stampNumber: tier.stampNumber ?? 1,
                rewardType: tier.rewardType ?? "FREE_ITEM",
                rewardDescription: tier.rewardDescription ?? "",
                discountAmount: tier.discountAmount ?? null,
            })),
            }
          : undefined,
      },
      include: { rewardTiers: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Error creating loyalty program:", err);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}


export async function GET() {
  const program = await prisma.loyaltyProgram.findFirst();
  return NextResponse.json(program);
}

export async function PUT(req: Request) {
  const body = await req.json();

  try {
    const existing = await prisma.loyaltyProgram.findFirst();

    if (!existing) {
      return NextResponse.json(
        { error: "No loyalty program found to update" },
        { status: 404 }
      );
    }

    const updated = await prisma.loyaltyProgram.update({
      where: { id: existing.id },
      data: {
        name: body.name, // only update program fields
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}