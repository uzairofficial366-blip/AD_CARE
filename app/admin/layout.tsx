import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPERADMIN" && session.role !== "ADMIN" && session.role !== "PHARMACIST") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true, email: true },
  });

  const unreadNotifications = await prisma.notification.count({
    where: { userId: session.userId, isRead: false },
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AdminSidebar user={user} unreadNotifications={unreadNotifications} />
      <div className="lg:ml-64 min-h-screen">
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
