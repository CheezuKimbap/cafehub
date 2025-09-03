import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

interface RouteParams {
  params: {
    id: string;
  };
}

// ✅ GET single product
export async function GET(req: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = params;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ PUT update product
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = params;

  try {
    const body = await req.json();
    const { name, description, price, image } = body;

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
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ DELETE product (soft delete recommended)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = params;

  try {
    // Hard delete:
    // await prisma.product.delete({ where: { id } });

    // 🔄 Soft delete (safer for e-commerce apps)
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
