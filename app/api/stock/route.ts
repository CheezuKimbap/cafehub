import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

// GET: fetch the ONLY stock
export async function GET() {
  try {
    const stock = await prisma.stock.findFirst();

    if (!stock) {
      return NextResponse.json(
        { error: "Stock record not found. Please create one." },
        { status: 404 }
      );
    }

    return NextResponse.json(stock);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}

// POST: create the ONLY stock record (manual)
export async function POST(req: Request) {
  try {
    const existing = await prisma.stock.findFirst();

    if (existing) {
      return NextResponse.json(
        { error: "Stock already exists. You can only have ONE record." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { paperCupCount = 0, plasticCupCount = 0 } = body;

    const newStock = await prisma.stock.create({
      data: {
        paperCupCount,
        plasticCupCount,
      },
    });

    return NextResponse.json(newStock, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create stock" }, { status: 500 });
  }
}

// PUT: update the ONLY stock
export async function PUT(req: Request) {
  try {
    const stock = await prisma.stock.findFirst();

    if (!stock) {
      return NextResponse.json(
        { error: "No stock record found. Create one first." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { paperCupCount, plasticCupCount } = body;

    const updated = await prisma.stock.update({
      where: { id: stock.id },
      data: {
        paperCupCount,
        plasticCupCount,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
