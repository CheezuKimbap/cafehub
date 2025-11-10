import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CartItem } from "@/components/cart/CartItem";
type AddonKey = { addonId: string; quantity: number };
// GET: Get cart for a customer
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId)
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });

  try {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true, // ✅ product is accessed THROUGH variant
              },
            },
            addons: {
              include: { addon: true },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [] }); // Return empty cart if none exists
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { customerId, variantId, quantity, addons } = await req.json();

  if (!customerId || !variantId || quantity <= 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    // Find or create cart
    let cart = await prisma.cart.findUnique({ where: { customerId } });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId, status: "ACTIVE" },
      });
    } else if (cart.status !== "ACTIVE") {
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { status: "ACTIVE" },
      });
    }

    // Fetch variant + product
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Calculate base price (variant price * qty)
    const baseTotal = variant.price * quantity;

    // Handle addons
    let addonTotalPerDrink = 0;

    if (addons && addons.length > 0) {
      const addonIds = addons.map((a: any) => a.addonId);
      const dbAddons = await prisma.addon.findMany({
        where: { id: { in: addonIds } },
      });

      addonTotalPerDrink = addons.reduce((sum: number, addon: any) => {
        const db = dbAddons.find((d) => d.id === addon.addonId);
        return db ? sum + db.price * addon.quantity : sum;
      }, 0);
    }

    const lineTotal = baseTotal + addonTotalPerDrink * quantity;

    // Check if exact item already exists
    const existingItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id, variantId },
      include: { addons: true },
    });

    const key = JSON.stringify(
      addons?.sort((a: any, b: any) => a.addonId.localeCompare(b.addonId)) ??
        [],
    );

    let existingItem = existingItems.find((item) => {
      const itemKey = JSON.stringify(
        item.addons
          .map((a) => ({ addonId: a.addonId, quantity: a.quantity }))
          .sort((a, b) => a.addonId.localeCompare(b.addonId)),
      );
      return itemKey === key;
    });

    if (existingItem) {
      // Update quantity
      const newQty = existingItem.quantity + quantity;
      const newTotal = variant.price * newQty + addonTotalPerDrink * newQty;

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty, price: newTotal },
      });
    } else {
      // Create new item
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
          price: lineTotal,
        },
      });

      // Add addons
      if (addons && addons.length > 0) {
        await prisma.cartItemAddon.createMany({
          data: addons.map((a: any) => ({
            cartItemId: newItem.id,
            addonId: a.addonId,
            quantity: a.quantity * quantity,
          })),
        });
      }
    }

    return NextResponse.json({ message: "Item added to cart" });
  } catch (error) {
    console.error("Add to cart failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
