import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const refills = await prisma.refillReminder.findMany({
      orderBy: { nextRefillDate: "asc" },
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true, email: true } },
      },
    });
    return NextResponse.json({ refills });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
