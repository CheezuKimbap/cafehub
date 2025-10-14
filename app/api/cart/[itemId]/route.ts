import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Update cart item and optionally its addons
export async function PUT(req: NextRequest, context: any) {
  const { itemId } = (await context.params) as { itemId: string };

  if (!itemId) {
    return NextResponse.json({ error: "cartItemId required" }, { status: 400 });
  }

  try {
    const { quantity, addons } = (await req.json()) as {
      quantity?: number;
      addons?: { addonId: string; quantity: number }[];
    };

    // Fetch the existing cart item including product and addons
    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        addons: { include: { addon: true } },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 },
      );
    }

    // 1️⃣ Update base quantity if provided
    if (quantity && quantity > 0) {
      existingItem.quantity = quantity;
    }

    // 2️⃣ Update addons if provided
    if (addons && addons.length > 0) {
      await Promise.all(
        addons.map(({ addonId, quantity }) =>
          prisma.cartItemAddon.upsert({
            where: { cartItemId_addonId: { cartItemId: itemId, addonId } },
            update: { quantity }, // update existing addon quantity
            create: { cartItemId: itemId, addonId, quantity }, // create new if not exists
          }),
        ),
      );
    }

    // Refresh updatedItem including addons
    const updatedItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        addons: { include: { addon: true } },
      },
    });

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Cart item not found after update" },
        { status: 404 },
      );
    }

    // 3️⃣ Recalculate total price: base product + all addons
    const addonTotal = updatedItem.addons.reduce(
      (sum, a) => sum + a.quantity * a.addon.price,
      0,
    );
    const totalPrice =
      (updatedItem.product.price + addonTotal) * updatedItem.quantity;

    // 4️⃣ Update cartItem price
    const finalItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { price: totalPrice, quantity },
      include: {
        product: true,
        addons: { include: { addon: true } },
      },
    });

    return NextResponse.json(finalItem, { status: 200 });
  } catch (error) {
    console.error("Failed to update cart item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
// ✅ Delete cart item (no change)
export async function DELETE(req: NextRequest, context: any) {
  const { itemId } = (await context.params) as { itemId: string };

  if (!itemId) {
    return NextResponse.json({ error: "cartItemId required" }, { status: 400 });
  }

  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json(
      { message: "Item removed from cart" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete cart item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
