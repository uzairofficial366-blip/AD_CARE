import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { validateStatusTransition, type OrderStatus } from "@/lib/types/state-machine";
import { logAudit } from "@/lib/auth/rbac";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const body = await request.json();
    const { status, deliveryAgentName, estimatedDelivery, paymentStatus, cancelReason } = body;

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const updateData: any = {};

    if (status && status !== order.status) {
      const validation = validateStatusTransition(order.status as OrderStatus, status as OrderStatus);
      if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });
      updateData.status = status;

      // Log the status change
      await logAudit({
        actorId: admin.session.userId,
        action: "ORDER_STATUS_CHANGED",
        entityType: "Order",
        entityId: order.id,
        oldValues: { status: order.status },
        newValues: { status },
      });
    }

    if (deliveryAgentName !== undefined) updateData.deliveryAgentName = deliveryAgentName;
    if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery;
    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      await logAudit({
        actorId: admin.session.userId,
        action: "ORDER_PAYMENT_STATUS_CHANGED",
        entityType: "Order",
        entityId: order.id,
        oldValues: { paymentStatus: order.paymentStatus },
        newValues: { paymentStatus },
      });
    }
    if (cancelReason) updateData.cancelReason = cancelReason;

    const updatedOrder = await prisma.order.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}
