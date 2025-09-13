import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId query parameter is required" },
        { status: 400 }
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
      { status: 500 }
    );
  }
}
