import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId, paymentMethod, cardDetails } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.userId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (paymentMethod === "CASH_ON_DELIVERY" || paymentMethod === "BANK_TRANSFER") {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "PENDING", paymentMethod },
      });
      return NextResponse.json({ success: true, status: "PENDING", message: "Payment pending on delivery." });
    }

    // Mock card / wallet payment — always succeeds in dev
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentMethod,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "PAYMENT_RECEIVED",
        entityType: "Order",
        entityId: orderId,
        metadata: JSON.stringify({ transactionId, paymentMethod, amount: order.totalAmount }),
      },
    });

    return NextResponse.json({
      success: true,
      status: "PAID",
      transactionId,
      message: "Payment processed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Payment failed" }, { status: 500 });
  }
}
