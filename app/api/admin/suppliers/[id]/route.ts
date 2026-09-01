import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const body = await request.json();
    const supplier = await prisma.supplier.update({ where: { id: params.id }, data: { ...(body.name && { name: body.name }), ...(body.contactPerson !== undefined && { contactPerson: body.contactPerson }), ...(body.email !== undefined && { email: body.email }), ...(body.phone !== undefined && { phone: body.phone }), ...(body.isActive !== undefined && { isActive: body.isActive }) } });
    return NextResponse.json({ success: true, supplier });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    await prisma.supplier.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
