export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(
        new URL("/verify-required?error=invalid-link", req.url)
      );
    }

    // 🔍 Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    // ❌ Token not found or expired
    if (
      !verificationToken ||
      verificationToken.expires < new Date()
    ) {
      return NextResponse.redirect(
        new URL("/verify-required?error=expired", req.url)
      );
    }

    // ✅ Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // 🧹 Cleanup token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    // 🎉 Success
    return NextResponse.redirect(
      new URL("/login?verified=true", req.url)
    );
  } catch (err) {
    console.error("VERIFY EMAIL ERROR ❌", err);

    return NextResponse.redirect(
      new URL("/verify-required?error=server-error", req.url)
    );
  }
}
