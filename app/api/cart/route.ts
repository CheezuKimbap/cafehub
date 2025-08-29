import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, productId, quantity } = body;

    if (!customerId || !productId || quantity <= 0) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { carts: true },
    });

    if (!customer) {
      return new Response(JSON.stringify({ error: "Customer not found" }), { status: 404 });
    }

    // Get active cart or create one
    let cart = customer.carts.find(c => c.status === "ACTIVE" && !c.isDeleted);
    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId: customer.id, status: "ACTIVE" },
      });
    }

    // Check if product already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, isDeleted: false },
    });

    if (existingItem) {
      // Increase quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity,
          price: product.price,
        },
      });
    }

    return new Response(JSON.stringify({ message: "Product added to cart" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return new Response(JSON.stringify({ error: "Missing customerId" }), { status: 400 });
  }

  const cart = await prisma.cart.findFirst({
    where: { customerId, status: "ACTIVE", isDeleted: false },
    include: {
      items: {
        where: { isDeleted: false },
        include: { product: true },
      },
    },
  });

  if (!cart) {
    return new Response(JSON.stringify({ message: "No active cart" }), { status: 200 });
  }

  return new Response(JSON.stringify(cart), { status: 200 });
}

export async function PUT(req: Request) {
  const { customerId, productId, quantity } = await req.json();

  if (!customerId || !productId || quantity < 0) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  const cart = await prisma.cart.findFirst({
    where: { customerId, status: "ACTIVE", isDeleted: false },
  });

  if (!cart) return new Response(JSON.stringify({ error: "Cart not found" }), { status: 404 });

  const cartItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, isDeleted: false },
  });

  if (!cartItem) return new Response(JSON.stringify({ error: "Cart item not found" }), { status: 404 });

  if (quantity === 0) {
    // soft delete
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { isDeleted: true },
    });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });
  }

  return new Response(JSON.stringify({ message: "Cart updated" }), { status: 200 });
}

export async function DELETE(req: Request) {
  const { customerId, productId } = await req.json();

  if (!customerId || !productId) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  const cart = await prisma.cart.findFirst({
    where: { customerId, status: "ACTIVE", isDeleted: false },
  });

  if (!cart) return new Response(JSON.stringify({ error: "Cart not found" }), { status: 404 });

  const cartItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, isDeleted: false },
  });

  if (!cartItem) return new Response(JSON.stringify({ error: "Cart item not found" }), { status: 404 });

  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { isDeleted: true },
  });

  return new Response(JSON.stringify({ message: "Cart item deleted (soft)" }), { status: 200 });
}