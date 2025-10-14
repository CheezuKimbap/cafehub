import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId query parameter is required" },
        { status: 400 },
      );
    }

    const discounts = await prisma.discount.findMany({
      where: {
        customerId,
        isRedeemed: false, // only unused
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(discounts, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch discounts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerId, type, description, discountAmount, productId } =
      await req.json();

    // Validate inputs
    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 },
      );
    }

    if (!type || !["PERCENTAGE_OFF", "FREE_ITEM"].includes(type)) {
      return NextResponse.json(
        { error: "Valid discount type is required" },
        { status: 400 },
      );
    }

    if (type === "PERCENTAGE_OFF" && !discountAmount) {
      return NextResponse.json(
        { error: "discountAmount is required for PERCENTAGE_OFF" },
        { status: 400 },
      );
    }

    if (type === "FREE_ITEM" && !productId) {
      return NextResponse.json(
        { error: "productId is required for FREE_ITEM" },
        { status: 400 },
      );
    }

    // Create discount
    const discount = await prisma.discount.create({
      data: {
        customerId,
        type,
        description,
        discountAmount: type === "PERCENTAGE_OFF" ? discountAmount : null,
        productId: type === "FREE_ITEM" ? productId : null,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create discount:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
