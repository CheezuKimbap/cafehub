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
            product: true,
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
  const { customerId, productId, quantity, servingType, addons } =
    await req.json();

  if (!customerId || !productId || quantity <= 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    // ✅ Find or create cart
    let cart = await prisma.cart.findUnique({ where: { customerId } });

    if (cart) {
      if (cart.status !== "ACTIVE") {
        cart = await prisma.cart.update({
          where: { id: cart.id },
          data: { status: "ACTIVE" },
        });
      }
    } else {
      cart = await prisma.cart.create({
        data: { customerId, status: "ACTIVE" },
      });
    }

    // ✅ Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // ✅ Calculate addon total per drink
    let addonTotalPerDrink = 0;
    let dbAddons: { id: string; price: number }[] = [];

    if (addons && Array.isArray(addons) && addons.length > 0) {
      const addonIds = addons.map((a: any) => a.addonId);
      dbAddons = await prisma.addon.findMany({
        where: { id: { in: addonIds } },
      });

      addonTotalPerDrink = addons.reduce((sum: number, addon: any) => {
        const dbAddon = dbAddons.find((a) => a.id === addon.addonId);
        if (dbAddon) {
          return sum + dbAddon.price * addon.quantity;
        }
        return sum;
      }, 0);
    }

    // ✅ Line total
    const lineTotal = product.price * quantity + addonTotalPerDrink * quantity;

    // ✅ Check if identical item exists
    const candidateItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id, productId, servingType },
      include: { addons: true },
    });

    // Normalize addons for comparison
    const incomingAddonKey = JSON.stringify(
      (addons || [])
        .map((a: any) => ({ addonId: a.addonId, quantity: a.quantity }))
        .sort((a: AddonKey, b: AddonKey) => a.addonId.localeCompare(b.addonId)),
    );
    let cartItem = null;
    for (const item of candidateItems) {
      const itemAddonKey = JSON.stringify(
        item.addons
          .map((a) => ({ addonId: a.addonId, quantity: a.quantity }))
          .sort((a, b) => a.addonId.localeCompare(b.addonId)),
      );

      if (itemAddonKey === incomingAddonKey) {
        cartItem = item;
        break;
      }
    }

    // ✅ Update or Create
    if (cartItem) {
      // Merge quantities
      const newQuantity = cartItem.quantity + quantity;
      const updatedLineTotal =
        product.price * newQuantity + addonTotalPerDrink * newQuantity;

      cartItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: {
          quantity: newQuantity,
          price: updatedLineTotal,
        },
      });

      // Update addon quantities too
      if (addons && Array.isArray(addons)) {
        for (const addon of addons) {
          if (!addon.addonId || addon.quantity <= 0) continue;

          const existingAddon = await prisma.cartItemAddon.findFirst({
            where: {
              cartItemId: cartItem.id,
              addonId: addon.addonId,
            },
          });

          if (existingAddon) {
            await prisma.cartItemAddon.update({
              where: { id: existingAddon.id },
              data: {
                quantity: existingAddon.quantity + addon.quantity * quantity,
              },
            });
          }
        }
      }
    } else {
      // Create new cartItem
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          servingType,
          price: lineTotal,
        },
      });

      // Add addons for this new item
      if (addons && Array.isArray(addons)) {
        for (const addon of addons) {
          if (!addon.addonId || addon.quantity <= 0) continue;
          await prisma.cartItemAddon.create({
            data: {
              cartItemId: cartItem.id,
              addonId: addon.addonId,
              quantity: addon.quantity * quantity,
            },
          });
        }
      }
    }

    return NextResponse.json({ message: "Item added to cart" });
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
