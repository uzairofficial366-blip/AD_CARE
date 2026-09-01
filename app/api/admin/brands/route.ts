import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
    return NextResponse.json({ brands });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: "Brand with this name already exists." }, { status: 409 });
    const brand = await prisma.brand.create({ data: { name, slug, description: description || null } });
    return NextResponse.json({ success: true, brand });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
