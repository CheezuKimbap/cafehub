import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const {
      customerId,
      phoneNumber,
      preferences,
      address,
      firstName,
      lastName,
      password,
      email,
      image,
    } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing customerId" },
        { status: 400 },
      );
    }

    // Load customer + user + accounts
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { users: { include: { accounts: true } } },
    });

    if (!customer || customer.users.length === 0) {
      return NextResponse.json(
        { error: "Customer or associated User not found" },
        { status: 404 },
      );
    }

    // Assuming the first user is the primary one
    const user = customer.users[0];

    // Determine auth type
    const isOAuth = user.accounts.length > 0;
    const hasPassword = !!customer.password;

    // Prepare optional password update
    let hashedPassword: string | undefined;
    if (password && password.trim().length > 0) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Rule: block email change if OAuth
    if (isOAuth && email) {
      return NextResponse.json(
        { error: "Email cannot be changed for OAuth accounts" },
        { status: 400 },
      );
    }

    // Transaction: update User, Customer, and Profile together
    const [updatedUser, updatedCustomer, profile] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          ...(firstName || lastName
            ? {
                name: [
                  firstName ?? customer.firstName,
                  lastName ?? customer.lastName,
                ]
                  .filter(Boolean)
                  .join(" "),
              }
            : {}),
          ...(hashedPassword && { password: hashedPassword }),
          ...(!isOAuth && email ? { email } : {}),
          ...(image && { image }),
        },
      }),
      prisma.customer.update({
        where: { id: customer.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(!isOAuth && email ? { email } : {}),
          ...(hashedPassword && { password: hashedPassword }),
        },
      }),
      prisma.profile.upsert({
        where: { customerId: customer.id },
        update: {
          ...(phoneNumber && { phoneNumber }),
          ...(preferences && { preferences }),
          ...(address && { address }),
        },
        create: {
          customerId: customer.id,
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
      { status: 500 },
    );
  }
}
