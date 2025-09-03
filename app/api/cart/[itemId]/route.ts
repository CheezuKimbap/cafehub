import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  itemId: string;
}

// PUT: Update cart item quantity
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { itemId } = params;
  const { quantity } = await req.json();

  if (!itemId || quantity <= 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!existingItem) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity, price: existingItem.product.price * quantity },
      include: { product: true },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Failed to update cart item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest, { params }: { params: { itemId: string } }) {
  const { itemId } = params;
  if (!itemId) return NextResponse.json({ error: "cartItemId required" }, { status: 400 });

  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ message: "Item removed from cart" });
}
