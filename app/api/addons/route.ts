import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyGuard";

export async function POST(req: NextRequest) {
   
  const { name, price } = await req.json();

  try{
    const newAddon = await prisma.addon.create({
        data:{
            name,
            price
        }
    })
    return NextResponse.json(newAddon , { status: 201 });  
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create addon" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const addons = await prisma.addon.findMany({
      include: {
        orderItems: true, // optional: include related order items
        cartItems: true,  // optional: include related cart items
      },
    });
    return NextResponse.json(addons);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch addons" }, { status: 500 });
  }
}