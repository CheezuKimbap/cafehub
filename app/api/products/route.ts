import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { validateApiKey } from "@/app/lib/apiKeyGuard";


export async function GET(req: NextRequest) {
  const authError = validateApiKey(req)
  if (authError) return authError  
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req)
  if (authError) return authError  
  try {
    const body = await req.json();
    const { name, description, price } = body;

    if (!name || !description || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function PUT(req: NextRequest) {
  const authError = validateApiKey(req)
  if (authError) return authError  
  const { id, name, description, price } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { name, description, price },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const authError = validateApiKey(req)
  if (authError) return authError  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted successfully" });
}