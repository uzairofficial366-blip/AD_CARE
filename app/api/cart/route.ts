import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ items: [] });

    const items = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          select: {
            id: true, name: true, price: true, salePrice: true,
            stockQuantity: true, isPrescriptionRequired: true,
            imageUrl: true, slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = items.map((ci) => ({
      id: ci.product.id,
      name: ci.product.name,
      price: ci.product.salePrice && ci.product.salePrice < ci.product.price ? ci.product.salePrice : ci.product.price,
      isPrescriptionRequired: ci.product.isPrescriptionRequired,
      imageUrl: ci.product.imageUrl,
      quantity: ci.quantity,
    }));

    return NextResponse.json({ items: mapped });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items } = await request.json();
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    await prisma.cartItem.deleteMany({ where: { userId: session.userId } });

    for (const item of items) {
      if (!item.id || !item.quantity) continue;
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) continue;

      await prisma.cartItem.create({
        data: {
          userId: session.userId,
          productId: item.id,
          quantity: item.quantity,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, quantity } = await request.json();
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.userId, productId },
      });
    } else {
      await prisma.cartItem.upsert({
        where: { userId_productId: { userId: session.userId, productId } },
        update: { quantity },
        create: { userId: session.userId, productId, quantity },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = await request.json();
    if (productId) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.userId, productId },
      });
    } else {
      await prisma.cartItem.deleteMany({ where: { userId: session.userId } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
