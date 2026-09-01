import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import Link from "next/link";
import OrderDetailClient from "./client";

export const revalidate = 0;

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-xl border text-center">
          <h2 className="text-xl font-bold text-slate-900">Login Required</h2>
          <p className="text-xs text-slate-500 mt-2">Please sign in to view order details.</p>
          <Link href="/login" className="inline-block mt-4 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition">Sign In</Link>
        </div>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, prescription: true },
  });

  if (!order || order.userId !== session.userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-xl border text-center">
          <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
          <Link href="/account/orders" className="inline-block mt-4 text-xs font-bold text-teal-700 hover:underline">← Return to Orders</Link>
        </div>
      </div>
    );
  }

  return <OrderDetailClient order={order as any} />;
}
