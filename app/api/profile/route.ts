import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const {
      userId,
      phoneNumber,
      preferences,
      address,
      firstName,
      lastName,
      password,
      email,
      image,
    } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Load user + customer + accounts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true, accounts: true },
    });

    if (!user?.customer) {
      return NextResponse.json(
        { error: "User or Customer not found" },
        { status: 404 }
      );
    }

    // Determine auth type
    const isOAuth = user.accounts.length > 0;
    const hasPassword = !!user.customer.password;

    // Prepare optional password update
    let hashedPassword: string | undefined;
    if (password && password.trim().length > 0) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Rule: block email change if OAuth or Hybrid
    if (isOAuth && email) {
      return NextResponse.json(
        { error: "Email cannot be changed for OAuth accounts" },
        { status: 400 }
      );
    }

    // Transaction: update User, Customer, and Profile together
    const [updatedUser, updatedCustomer, profile] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          // Concatenate first + last for display name
          ...(firstName || lastName
            ? {
                name: [
                  firstName ?? user.customer.firstName,
                  lastName ?? user.customer.lastName,
                ]
                  .filter(Boolean)
                  .join(" "),
              }
            : {}),
          ...(hashedPassword && { password: hashedPassword }),
          // Email only for non-OAuth accounts
          ...(!isOAuth && email ? { email } : {}),
          ...(image && { image }),
        },
      }),

      prisma.customer.update({
        where: { id: user.customer.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          // Email only for non-OAuth accounts
          ...(!isOAuth && email ? { email } : {}),
          ...(hashedPassword && { password: hashedPassword }),
        },
      }),

      prisma.profile.upsert({
        where: { customerId: user.customer.id },
        update: {
          ...(phoneNumber && { phoneNumber }),
          ...(preferences && { preferences }),
          ...(address && { address }),
        },
        create: {
          customerId: user.customer.id,
          phoneNumber: phoneNumber ?? "",
          preferences: preferences ?? "",
          address: address ?? "",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      customer: updatedCustomer,
      profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
