export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sendVerificationEmail } from "@/lib/auth/sendVerificationEmail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, role } = body;

    if (!firstName || !lastName || !email || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // =========================
    // ADMIN (no verification)
    // =========================
    if (role === "ADMIN") {
      await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          role,
          password: hashedPassword,
          emailVerified: new Date(),
        },
      });

      return Response.json(
        {
          success: true,
          message: "Admin account created.",
        },
        { status: 201 }
      );
    }

    // =========================
    // CUSTOMER (verification required)
    // =========================
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        emailVerified: null,
        customer: {
          create: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
          },
        },
      },
    });

    await sendVerificationEmail({
      id: user.id,
      email: user.email!,
      name: user.name,
    });

    return Response.json(
      {
        success: true,
        message: "Account created. Please verify your email.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("REGISTER ERROR ❌", err);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
