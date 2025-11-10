import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        variants: true,
        reviews: {
          select: { rating: true }, // only fetch the rating field
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // calculate average rating
    const productsWithRating = products.map((product) => {
      const totalReviews = product.reviews.length;
      const avgRating =
        totalReviews > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      // return product without reviews array
      const { reviews, ...rest } = product;
      return {
        ...rest,
        avgRating,
        totalReviews,
      };
    });

    return NextResponse.json(productsWithRating);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, image, categoryId, canDiscount, variants } =
      body;

    if (!name || !description || !categoryId || !variants?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        image,
        categoryId,
        canDiscount,
        variants: {
          create: variants.map((v: any) => ({
            servingType: v.servingType || null,
            size: v.size || null,
            price: Number(v.price),
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
