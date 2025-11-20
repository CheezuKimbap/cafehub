import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured") === "true";

    let products: any[] = [];

    if (featured) {
      // Step 1: Get product IDs sorted by most sold
     const sortedProductIds = (await prisma.product.aggregateRaw({
    pipeline: [
        { $match: { isDeleted: false } },
        {
        $lookup: {
            from: "ProductVariant",
            localField: "_id",
            foreignField: "productId",
            as: "variants",
        },
        },
        { $unwind: "$variants" },
        {
        $lookup: {
            from: "OrderItem",
            localField: "variants._id",
            foreignField: "variantId",
            as: "orderItems",
        },
        },
        {
        $group: {
            _id: "$_id",
            totalSold: { $sum: { $sum: "$orderItems.quantity" } },
        },
        },
        { $sort: { totalSold: -1 } },
    ],
    })) as unknown as { _id: string }[];

      const productIds = sortedProductIds.map((p) => p._id);

      // Step 2: Fetch full products matching those IDs
      products = await prisma.product.findMany({
        where: { id: { in: productIds }, isDeleted: false },
        include: {
          variants: true,
          reviews: { select: { rating: true } },
        },
      });

      // Step 3: Sort in the same order as aggregation
      products.sort(
        (a, b) => productIds.indexOf(a.id) - productIds.indexOf(b.id)
      );
    } else {
      // Normal fetch ordered by creation date
      products = await prisma.product.findMany({
        where: { isDeleted: false },
        include: {
          variants: true,
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Calculate average rating
    const productsWithRating = products.map((product) => {
      const totalReviews = product.reviews?.length || 0;
      const avgRating =
        totalReviews > 0
          ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
            totalReviews
          : 0;

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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
