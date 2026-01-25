import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, context: any) {
  const { id } = context.params as { id: string };
  try {
    const notification = await prisma.notification.update({
      where: { id: id },
      data: { readAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
