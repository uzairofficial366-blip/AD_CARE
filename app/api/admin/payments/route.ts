import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true } }, user: { select: { name: true, email: true } } },
    });
    return NextResponse.json({ payments });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
