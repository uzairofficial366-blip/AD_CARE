import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { logAudit } from "@/lib/auth/rbac";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(); if (admin.error) return admin.error;
    const body = await request.json();
    const oldReview = await prisma.review.findUnique({ where: { id: params.id } });
    if (!oldReview) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    const review = await prisma.review.update({ where: { id: params.id }, data: { ...(body.isApproved !== undefined && { isApproved: body.isApproved }), ...(body.isReported !== undefined && { isReported: body.isReported }), ...(body.reportReason !== undefined && { reportReason: body.reportReason }) } });
    if (body.isApproved !== undefined) {
      await logAudit({ actorId: admin.session.userId, action: body.isApproved ? "REVIEW_APPROVED" : "REVIEW_DISAPPROVED", entityType: "Review", entityId: params.id, oldValues: { isApproved: oldReview.isApproved }, newValues: { isApproved: body.isApproved } });
    }
    return NextResponse.json({ success: true, review });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
