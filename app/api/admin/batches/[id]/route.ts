import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const body = await request.json();
    const batch = await prisma.batch.update({ where: { id: params.id }, data: { ...(body.quantity !== undefined && { quantity: body.quantity }), ...(body.costPrice !== undefined && { costPrice: parseFloat(body.costPrice) }), ...(body.sellingPrice !== undefined && { sellingPrice: parseFloat(body.sellingPrice) }), ...(body.expiryDate && { expiryDate: new Date(body.expiryDate) }), ...(body.status && { status: body.status }) } });
    return NextResponse.json({ success: true, batch });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
