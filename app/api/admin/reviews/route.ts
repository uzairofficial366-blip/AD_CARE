import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, sku: true } }, user: { select: { name: true, email: true } } },
    });
    return NextResponse.json({ reviews });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
