import { validateApiKey } from "@/lib/apiKeyGuard";
import { prisma } from "@/lib/prisma";
import { User } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";
import { custom } from "zod";

export async function GET(req: NextRequest, context: any) {
  const { id } = (await context.params) as { id: string };

  try {
    const customer = await prisma.customer.findFirst({
      where: { id },
      include: {
        profile: true,
        orders: true,
        users: {
          include: {
            accounts: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Sanitize sensitive fields
    const safeCustomer = {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      currentStamps: customer.currentStamps,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      profile: customer.profile,
      orders: customer.orders,
      user: customer.users?.[0]
        ? {
            image: customer.users[0].image ?? undefined,
            accountCount: customer.users[0].accounts.length,
          }
        : undefined,
    };

    return NextResponse.json(safeCustomer, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
