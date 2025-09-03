import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

interface Params {
  id: string;
}

// GET single product
export async function GET(req: NextRequest, { params }: { params: Params }) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = params;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT update product
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = params;
  const body = await req.json();
  const { name, description, price, image } = body;

  if (!name && !description && price === undefined && !image) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { name, description, price, image, updatedAt: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE product or make this a soft delete
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
