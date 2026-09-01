import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, brand: true },
    });
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const body = await request.json();
    const {
      name, description, sku, price, salePrice, stockQuantity,
      isPrescriptionRequired, dosageForm, activeIngredients,
      usageInstructions, warnings, imageUrl, categoryId, brandId,
      isFeatured, isVisible,
    } = body;

    if (!name || !description || !sku || !price || !categoryId) {
      return NextResponse.json(
        { error: "name, description, sku, price, and categoryId are required." },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const existing = await prisma.product.findFirst({ where: { OR: [{ slug }, { sku }] } });
    if (existing) {
      return NextResponse.json({ error: "A product with this name or SKU already exists." }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        sku,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stockQuantity: parseInt(stockQuantity || "0", 10),
        isPrescriptionRequired: isPrescriptionRequired || false,
        dosageForm: dosageForm || null,
        activeIngredients: activeIngredients || null,
        usageInstructions: usageInstructions || null,
        warnings: warnings || null,
        imageUrl: imageUrl || null,
        categoryId,
        brandId: brandId || null,
        isFeatured: isFeatured || false,
        isVisible: isVisible !== false,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
