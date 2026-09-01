import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const deliveries = await prisma.delivery.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { orderNumber: true, totalAmount: true, shippingAddressJson: true, user: { select: { name: true } } } },
        agent: { select: { name: true, phone: true } },
      },
    });
    return NextResponse.json({ deliveries });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
