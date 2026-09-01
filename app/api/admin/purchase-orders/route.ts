import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        supplier: { select: { name: true } },
        items: { select: { productId: true, quantity: true, unitCost: true } },
      },
    });
    return NextResponse.json({ purchaseOrders });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
