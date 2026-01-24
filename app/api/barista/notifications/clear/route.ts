import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  await prisma.notification.deleteMany({
    where: {
      OR: [
        { customerId: null },
        { customerId: { equals: null } },
      ],
    },
  });

  return NextResponse.json({ success: true });
}
