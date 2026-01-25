import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ PATCH mark notification as read
export async function PATCH(req: NextRequest, context: any) {
  const { id } = context.params as { id: string };

  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return NextResponse.json(
      { message: "Notification marked as read", notification },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
