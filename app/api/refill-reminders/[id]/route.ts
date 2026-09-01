import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.refillReminder.findFirst({
      where: { id: params.id, userId: session.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    const { frequencyDays, notes, isActive } = await request.json();

    const updateData: any = {};
    if (frequencyDays !== undefined) {
      updateData.frequencyDays = parseInt(frequencyDays, 10);
      const next = new Date();
      next.setDate(next.getDate() + parseInt(frequencyDays, 10));
      updateData.nextRefillDate = next;
    }
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const reminder = await prisma.refillReminder.update({
      where: { id: params.id },
      data: updateData,
      include: { product: true },
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.refillReminder.findFirst({
      where: { id: params.id, userId: session.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    await prisma.refillReminder.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
