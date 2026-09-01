import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { batches: true, purchaseOrders: true } } } });
    return NextResponse.json({ suppliers });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const { name, contactPerson, email, phone, address } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    const supplier = await prisma.supplier.create({ data: { name, contactPerson: contactPerson || null, email: email || null, phone: phone || null, address: address || null } });
    return NextResponse.json({ success: true, supplier });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
