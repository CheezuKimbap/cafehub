import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get customer cart
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });

  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json(cart);
}

// POST: Add item to cart
export async function POST(req: NextRequest) {
 const { customerId, productId, quantity } = await req.json();

  if (!customerId || !productId || quantity <= 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Find or create cart
  let cart = await prisma.cart.findUnique({ where: { customerId } });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { customerId, status: "ACTIVE" },
    });
  }

  // Get product info
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check if product already exists in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
        price: product.price * (existingItem.quantity + quantity), // recalc total
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price: product.price * quantity, // ✅ use product.price * quantity
      },
    });
  }

  return NextResponse.json({ message: "Item added to cart" });
}

// PUT: Update cart item quantity
export async function PUT(req: NextRequest) {
  const { cartItemId, quantity } = await req.json();

  if (!cartItemId || quantity <= 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Get cart item with product (to know unit price)
  const existingItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true },
  });

  if (!existingItem) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  // Recalculate total price based on quantity
  const updatedItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: {
      quantity,
      price: existingItem.product.price * quantity, // ✅ total price
    },
    include: { product: true },
  });

  return NextResponse.json(updatedItem);
}

// DELETE: Remove item from cart
export async function DELETE(req: NextRequest) {
  const { cartItemId } = await req.json();
  if (!cartItemId) return NextResponse.json({ error: "cartItemId required" }, { status: 400 });

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  return NextResponse.json({ message: "Item removed from cart" });
}
