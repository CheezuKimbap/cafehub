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
        variants: true,
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

export async function PUT(req: NextRequest, context: any) {
  const { id } = (await context.params) as { id: string };

  try {
    const body = await req.json();
    const { name, description, price, image, status, variants } = body;

    const updateData: any = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price }),
      ...(status && { status }),
      updatedAt: new Date(),
    };

    if (image) {
      updateData.image = image;
    }

    // ✅ Update main product first (without variants)
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // ✅ If variants provided, perform UPSERT logic
    if (Array.isArray(variants)) {
      // Fetch existing variants
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id },
      });

      // Convert to easier check format
      const existingIds = new Set(existingVariants.map((v) => v.id));
      const incomingIds = new Set(
        variants.filter((v) => v.id).map((v) => v.id),
      );

      // ✅ Delete variants that were removed
      const variantsToDelete = [...existingIds].filter(
        (variantId) => !incomingIds.has(variantId),
      );

      await prisma.productVariant.deleteMany({
        where: { id: { in: variantsToDelete } },
      });

      // ✅ Create or Update incoming variants
      for (const v of variants) {
        if (v.id) {
          // Update existing
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              servingType: v.servingType,
              size: v.size ?? null,
              price: Number(v.price),
            },
          });
        } else {
          // Create new
          await prisma.productVariant.create({
            data: {
              productId: id,
              servingType: v.servingType,
              size: v.size ?? null,
              price: Number(v.price),
            },
          });
        }
      }
    }

    // ✅ Return updated product with variants
    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    return NextResponse.json(finalProduct, { status: 200 });
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
