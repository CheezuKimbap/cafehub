// app/api/discount/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

// ✅ GET single discount by ID
export async function GET(req: NextRequest, context: any) {
   

  const { id } = context.params as { id: string };

  try {
    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(discount, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch discount:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ PUT update discount
export async function PUT(req: NextRequest, context: any) {
   

  const { id } = context.params as { id: string };

  try {
    const body = await req.json();
    const {
      description,
      discountAmount,
      isForLoyalCustomer,
      isRedeemed,
    } = body;

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        ...(description ? { description } : {}),
        ...(discountAmount ? { discountAmount } : {}),
        ...(isForLoyalCustomer !== undefined
          ? { isForLoyalCustomer }
          : {}),
        ...(isRedeemed !== undefined
          ? {
              isRedeemed,
              usedAt: isRedeemed ? new Date() : null,
            }
          : {}),
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(
      { message: "Discount updated", discount: updatedDiscount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update discount:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE discount
export async function DELETE(req: NextRequest, context: any) {
   

  const { id } = context.params as { id: string };

  try {
    await prisma.discount.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Discount deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete discount:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
