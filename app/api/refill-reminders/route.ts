import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = await prisma.refillReminder.findMany({
      where: { userId: session.userId },
      include: { product: true },
      orderBy: { nextRefillDate: "asc" },
    });

    return NextResponse.json({ reminders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, frequencyDays, notes } = await request.json();

    if (!productId || !frequencyDays) {
      return NextResponse.json(
        { error: "productId and frequencyDays are required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const nextRefillDate = new Date();
    nextRefillDate.setDate(nextRefillDate.getDate() + parseInt(frequencyDays, 10));

    const reminder = await prisma.refillReminder.create({
      data: {
        userId: session.userId,
        productId,
        frequencyDays: parseInt(frequencyDays, 10),
        nextRefillDate,
        notes: notes || null,
        isActive: true,
      },
      include: { product: true },
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create reminder" }, { status: 500 });
  }
}
