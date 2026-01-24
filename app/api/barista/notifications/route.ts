import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        customerId: null, // barista notifications only
      },
      orderBy: { dateSent: "desc" },
      take: 30,
      select: {
        id: true,
        message: true,
        dateSent: true,
        readAt: true,
      },
    });

    return NextResponse.json(
      notifications.map(n => ({
        ...n,
        isRead: !!n.readAt, // 👈 normalize for frontend
      }))
    );
  } catch (err) {
    console.error("Notification fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
