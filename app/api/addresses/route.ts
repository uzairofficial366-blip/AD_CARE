import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, street, city, state, zipCode, country, isDefault } = body;

    if (!fullName || !phone || !street || !city || !state || !zipCode) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        fullName,
        phone,
        street,
        city,
        state,
        zipCode,
        country: country || "USA",
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create address" }, { status: 500 });
  }
}
