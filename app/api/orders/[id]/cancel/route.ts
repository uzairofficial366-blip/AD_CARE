import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "Order is already cancelled." }, { status: 400 });
    }

    if (order.status === "DELIVERED" || order.status === "SHIPPED") {
      return NextResponse.json(
        { error: "Cannot cancel an order that has been shipped or delivered." },
        { status: 400 }
      );
    }

    const { cancelReason } = await request.json();

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        cancelReason: cancelReason || "Cancelled by customer",
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
