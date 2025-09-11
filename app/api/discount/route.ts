import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all discounts
export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      where: { isActive: true },
      orderBy: { requiredStamps: "asc" },
    });
    return NextResponse.json(discounts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 });
  }
}

// POST new discount
export async function POST(req: Request) {
  try {
    const { description, discountAmount, requiredStamps, isActive } = await req.json();

    if (!description || !discountAmount || !requiredStamps) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const discount = await prisma.discount.create({
      data: {
        description,
        discountAmount,
        requiredStamps,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create discount" }, { status: 500 });
  }
}
