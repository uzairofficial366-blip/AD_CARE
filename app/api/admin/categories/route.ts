import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const { name, description, parentId } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: "Category with this name already exists." }, { status: 409 });
    const category = await prisma.category.create({ data: { name, slug, description: description || null, parentId: parentId || null } });
    return NextResponse.json({ success: true, category });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
