import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: params.id, userId: session.userId },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const { message } = await request.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const msg = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        senderId: session.userId,
        message: message.trim(),
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: { status: "OPEN" },
      });
    }

    return NextResponse.json({ success: true, message: msg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
