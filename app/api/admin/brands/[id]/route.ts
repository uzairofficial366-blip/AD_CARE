import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const body = await request.json();
    const brand = await prisma.brand.update({ where: { id: params.id }, data: { ...(body.name && { name: body.name }), ...(body.description !== undefined && { description: body.description || null }), ...(body.isVisible !== undefined && { isVisible: body.isVisible }) } });
    return NextResponse.json({ success: true, brand });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const productCount = await prisma.product.count({ where: { brandId: params.id } });
    if (productCount > 0) return NextResponse.json({ error: `Cannot delete: ${productCount} products use this brand.` }, { status: 400 });
    await prisma.brand.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
