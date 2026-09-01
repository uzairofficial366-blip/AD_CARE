import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const batches = await prisma.batch.findMany({
      orderBy: { expiryDate: "asc" },
      include: { product: { select: { name: true, sku: true } }, supplier: { select: { name: true } } },
    });
    return NextResponse.json({ batches });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const { productId, batchNumber, quantity, costPrice, sellingPrice, expiryDate, supplierId, warehouseLocation } = await request.json();
    if (!productId || !batchNumber || !quantity || !expiryDate) {
      return NextResponse.json({ error: "productId, batchNumber, quantity, and expiryDate are required." }, { status: 400 });
    }
    const batch = await prisma.batch.create({
      data: { productId, batchNumber, quantity: parseInt(quantity), costPrice: costPrice ? parseFloat(costPrice) : null, sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null, expiryDate: new Date(expiryDate), supplierId: supplierId || null, warehouseLocation: warehouseLocation || null },
    });
    // Update product stock
    await prisma.product.update({ where: { id: productId }, data: { stockQuantity: { increment: parseInt(quantity) } } });
    return NextResponse.json({ success: true, batch });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
