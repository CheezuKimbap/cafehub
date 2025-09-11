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
  const safeCustomers = customers.map((c) => ({
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    currentStamps: c.currentStamps,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    profile: c.profile,
    orders: c.orders,
    // 👇 don't include password (or any other private fields)
  }));
    // 3. Return JSON response
    return NextResponse.json(safeCustomers);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
