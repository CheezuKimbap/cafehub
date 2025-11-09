import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ name: "" }, { status: 200 });
    }

    // Find the customer and include related users
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { users: true }, // array of users
    });

    // Pick the first user's name if available
    const name = customer?.users?.[0]?.name || "";

    return NextResponse.json({ name }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ name: "" }, { status: 200 });
  }
}
