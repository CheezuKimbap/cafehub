import { validateApiKey } from "@/lib/apiKeyGuard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const { id } = await context.params as { id: string };

  try
  {
    const addon = await prisma.addon.findFirst({
        where: {
            id: id
        } ,
        include: {
        orderItems: true,
        cartItems: true,
      },
    })

      if (!addon) {
      return NextResponse.json({ error: "Addon not found" }, { status: 404 });
    }

    return NextResponse.json(addon);
  }
  catch(error){
    return NextResponse.json({ error: "Failed to fetch addon" }, { status: 500 });
  }
}