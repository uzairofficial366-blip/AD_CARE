import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const prescriptions = await prisma.prescription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true } },
        auditLogs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({ prescriptions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch prescriptions" }, { status: 500 });
  }
}
