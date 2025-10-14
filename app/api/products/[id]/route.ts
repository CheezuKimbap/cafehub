import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";
import { includes } from "zod";

// ✅ GET single product
export async function GET(req: NextRequest, context: any) {
  const { id } = (await context.params) as { id: string };

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true, // ✅ only fetch category name
          },
        },
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { category, ...rest } = product;

    const formattedProduct = {
      ...rest,
      categoryName: category?.name || null,
    };
    return NextResponse.json(formattedProduct, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ✅ PUT update product
export async function PUT(req: NextRequest, context: any) {
  const { id } = (await context.params) as { id: string };

  try {
    const body = await req.json();
    const { name, description, price, image, stock } = body;

    if (!name && !description && price === undefined && !image) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(image && { image }),
        ...(stock && { stock }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ✅ DELETE product (soft delete recommended)
export async function DELETE(req: NextRequest, context: any) {
  const { id } = (await context.params) as { id: string };

  try {
    // Hard delete:
    // await prisma.product.delete({ where: { id } });

    // 🔄 Soft delete (requires `deletedAt` in Prisma schema)
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
