import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true, brand: true },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const {
      name, description, sku, price, salePrice, stockQuantity,
      isPrescriptionRequired, dosageForm, activeIngredients,
      usageInstructions, warnings, imageUrl, categoryId, brandId,
      isFeatured, isVisible,
    } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(sku && { sku }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(salePrice !== undefined && { salePrice: salePrice ? parseFloat(salePrice) : null }),
        ...(stockQuantity !== undefined && { stockQuantity: parseInt(stockQuantity, 10) }),
        ...(isPrescriptionRequired !== undefined && { isPrescriptionRequired }),
        ...(dosageForm !== undefined && { dosageForm: dosageForm || null }),
        ...(activeIngredients !== undefined && { activeIngredients: activeIngredients || null }),
        ...(usageInstructions !== undefined && { usageInstructions: usageInstructions || null }),
        ...(warnings !== undefined && { warnings: warnings || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(categoryId && { categoryId }),
        ...(brandId !== undefined && { brandId: brandId || null }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isVisible !== undefined && { isVisible }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
