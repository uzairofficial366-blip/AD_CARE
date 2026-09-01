import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const settings = await prisma.siteSetting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
    return NextResponse.json({ settings });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const { settings } = await request.json();
    for (const setting of settings) {
      await prisma.siteSetting.upsert({ where: { key: setting.key }, update: { value: setting.value }, create: { key: setting.key, value: setting.value, label: setting.key.replace(/_/g, " "), group: "general" } });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
