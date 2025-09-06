import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get cart for a customer
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });

  try {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      return NextResponse.json({ items: [] }); // Return empty cart if none exists
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add item to cart
export async function POST(req: NextRequest) {
  const { customerId, productId, quantity, servingType } = await req.json();

  if (!customerId || !productId || quantity <= 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    // Find or create cart
    let cart = await prisma.cart.findUnique({ where: { customerId } });

    if (cart) {
      // Ensure existing cart is ACTIVE
      if (cart.status !== "ACTIVE") {
        cart = await prisma.cart.update({
          where: { id: cart.id },
          data: { status: "ACTIVE" },
        });
      }
    } else {
      // Create new cart
      cart = await prisma.cart.create({ data: { customerId, status: "ACTIVE" } });
    }

    // Fetch product
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Check if product already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          price: product.price * (existingItem.quantity + quantity),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          servingType,
          price: product.price * quantity,
        },
      });
    }

    return NextResponse.json({ message: "Item added to cart" });
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

