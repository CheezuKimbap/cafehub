import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Update cart item and optionally its addons
export async function PUT(req: NextRequest, context: any) {
  const { itemId } = context.params as { itemId: string };

  if (!itemId) {
    return NextResponse.json({ error: "cartItemId required" }, { status: 400 });
  }

  try {
    const { quantity, addons } = await req.json() as {
      quantity?: number;
      addons?: { addonId: string; quantity: number }[];
    };

    // 1. Update base cart item
    let updatedItem = null;
    if (quantity && quantity > 0) {
      const existingItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { product: true },
      });

      if (!existingItem) {
        return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
      }

      updatedItem = await prisma.cartItem.update({
        where: { id: itemId },
        data: {
          quantity,
          price: existingItem.product.price * quantity,
        },
        include: {
          product: true,
          addons: { include: { addon: true } },
        },
      });
    }

    // 2. Update addons if provided
    if (addons && addons.length > 0) {
      await Promise.all(
        addons.map(({ addonId, quantity }) =>
          prisma.cartItemAddon.update({
            where: {
              cartItemId_addonId: { cartItemId: itemId, addonId },
            },
            data: {
              quantity, // or use { increment: quantity }
            },
          })
        )
      );

      // Refresh updatedItem with addons
      updatedItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: {
          product: true,
          addons: { include: { addon: true } },
        },
      });
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Failed to update cart item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Delete cart item (no change)
export async function DELETE(req: NextRequest, context: any) {
  const { itemId } = context.params as { itemId: string };

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
