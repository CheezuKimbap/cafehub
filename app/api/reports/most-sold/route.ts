import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // your Prisma client

export async function GET() {
  try {
    // Aggregate total quantities sold per product
    const mostSold = await prisma.orderItem.groupBy({
      by: ["variantId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    // Map variantId → product name
    const result = await Promise.all(
      mostSold.map(async (item) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });
        return {
          name: variant?.product.name ?? "Unknown",
          value: item._sum.quantity ?? 0,
        };
      }),
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch most sold items" },
      { status: 500 },
    );
  }
}
