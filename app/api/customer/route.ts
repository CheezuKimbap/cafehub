// app/api/customer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

export async function GET(req: NextRequest) {
  // 1. Validate API key
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    // 2. Fetch customers, optionally you can add filters, pagination, or include relations
    const customers = await prisma.customer.findMany({     
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        orders: true, // include order history if needed
      },
    });

    // 3. Return JSON response
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
