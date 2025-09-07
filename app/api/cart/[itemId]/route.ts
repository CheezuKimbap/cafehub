import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Update cart item
export async function PUT(req: NextRequest, context: any) {
  const { itemId } = await context.params as { itemId: string };

  if (!itemId) {
    return NextResponse.json({ error: "cartItemId required" }, { status: 400 });
  }

  try {
    const { quantity } = await req.json();

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,        
        price: existingItem.product.price * quantity,
      },
      include: { product: true },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Failed to update cart item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Delete cart item
export async function DELETE(req: NextRequest, context: any) {
  const { itemId } = await context.params as { itemId: string };

  if (!itemId) {
    return NextResponse.json({ error: "cartItemId required" }, { status: 400 });
  }

  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ message: "Item removed from cart" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete cart item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
