// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust this import to your Prisma client

// ------------------
// GET Reviews
// ------------------
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const latest = url.searchParams.get("latest") === "true"; // true/false
    const limit = Number(url.searchParams.get("limit")) || undefined;

    const reviews = await prisma.review.findMany({
      where: productId ? { productId } : {}, // optional filter
      include: {
        customer: { select: { firstName: true, lastName: true, id: true } },
        product: { select: { name: true, id: true } },
      },
      orderBy: latest ? { createdAt: "desc" } : undefined, // sort by latest if requested
      take: limit, // limit if provided
    });

    return NextResponse.json(reviews);
  } catch (err) {
    console.error("GET /reviews error:", err);
    return NextResponse.json(
      { error: (err as any)?.message || "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

// ------------------
// POST Review
// ------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    const { productId, customerId, rating, comment } = body;
    if (!productId || !customerId || typeof rating !== "number") {
      return NextResponse.json(
        { error: "productId, customerId, and rating are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        customerId,
        rating,
        comment: comment || "",
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  }
}
