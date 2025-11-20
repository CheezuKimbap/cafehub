import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const productId = searchParams.get("productId");

  // fallback: missing params → cannot review
  if (!customerId || !productId) {
    return NextResponse.json({ canReview: false });
  }

  const orders = await prisma.order.findMany({
    where: {
      customerId,
      status: "COMPLETED",
      orderItems: {
        some: {
          variant: {
            productId,
          },
        },
      },
    },
    select: { id: true }, // we only need to know if at least one exists
    take: 1,              // no need to fetch all orders
  });

  return NextResponse.json({ canReview: orders.length > 0 });
}
