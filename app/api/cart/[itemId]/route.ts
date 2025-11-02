import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Update cart item and optionally addons
export async function PUT(req: NextRequest, context: any) {
  const { itemId } = context.params as { itemId: string };

  if (!itemId) {
    return NextResponse.json({ error: "cartItemId required" }, { status: 400 });
  }

  try {
    const { quantity, addons } = (await req.json()) as {
      quantity?: number;
      addons?: { addonId: string; quantity: number }[];
    };

    // ✅ Fetch cart item with variant + addons
    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        variant: true, // ✅ Now variant, not product
        addons: { include: { addon: true } },
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    const finalQuantity = quantity && quantity > 0 ? quantity : existingItem.quantity;

    // ✅ Update addons if provided
    if (addons && addons.length > 0) {
      await Promise.all(
        addons.map(({ addonId, quantity }) =>
          prisma.cartItemAddon.upsert({
            where: { cartItemId_addonId: { cartItemId: itemId, addonId } },
            update: { quantity },
            create: { cartItemId: itemId, addonId, quantity },
          })
        )
      );
    }

    // ✅ If quantity changes → scale addons to match
    if (finalQuantity !== existingItem.quantity) {
      await Promise.all(
        existingItem.addons.map(({ addonId }) =>
          prisma.cartItemAddon.update({
            where: { cartItemId_addonId: { cartItemId: itemId, addonId } },
            data: { quantity: finalQuantity },
          })
        )
      );
    }

    // ✅ Re-fetch latest
    const updatedItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        variant: true,
        addons: { include: { addon: true } },
      },
    });

    if (!updatedItem) {
      return NextResponse.json({ error: "Cart item not found after update" }, { status: 404 });
    }

    // ✅ Calculate price based on variant now
    const addonTotal = updatedItem.addons.reduce(
      (sum, a) => sum + a.quantity * a.addon.price,
      0
    );

    const totalPrice = (updatedItem.variant.price + addonTotal) * finalQuantity;

    // ✅ Save final cart price + qty
    const finalItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { price: totalPrice, quantity: finalQuantity },
      include: {
         variant: {
         include: {
            product: true, // ✅ keep product when returning update
            },
        },
        addons: { include: { addon: true } },
      },
    });

    return NextResponse.json(finalItem, { status: 200 });

  } catch (error) {
    console.error("Failed to update cart item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Delete stays same
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
