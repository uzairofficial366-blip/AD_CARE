import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  DollarSign, ShoppingCart, Package, Users, Pill, AlertTriangle,
  Clock, CheckCircle2, XCircle, TrendingUp, Truck, MessageSquare,
  ArrowUpRight, Star, CreditCard, RotateCw
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // ─── PARALLEL QUERIES FOR PERFORMANCE ──────────────────────
  const [
    totalRevenue,
    todayRevenue,
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    totalCustomers,
    newCustomersToday,
    totalProducts,
    outOfStockProducts,
    lowStockProducts,
    totalPrescriptions,
    pendingPrescriptions,
    approvedPrescriptions,
    rejectedPrescriptions,
    totalReviews,
    openTickets,
    activeCoupons,
    recentOrders,
    topProducts,
    paymentStats,
    deliveryStats,
    expiringBatches,
    lowStockItems,
  ] = await Promise.all([
    // Revenue
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),

    // Orders
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),

    // Customers
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),

    // Products
    prisma.product.count({ where: { isVisible: true } }),
    prisma.product.count({ where: { stockQuantity: 0, isVisible: true } }),
    prisma.product.count({ where: { AND: [{ stockQuantity: { lte: 10 } }, { stockQuantity: { gt: 0 } }], isVisible: true } }),

    // Prescriptions
    prisma.prescription.count(),
    prisma.prescription.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.prescription.count({ where: { status: "APPROVED" } }),
    prisma.prescription.count({ where: { status: "REJECTED" } }),

    // Reviews
    prisma.review.count(),

    // Support
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } } }),

    // Coupons
    prisma.coupon.count({ where: { isActive: true } }),

    // Recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),

    // Top products by sales
    prisma.product.findMany({
      take: 5,
      orderBy: { salesCount: "desc" },
      where: { isVisible: true },
      select: { name: true, salesCount: true, stockQuantity: true, price: true },
    }),

    // Payment stats
    prisma.payment.groupBy({
      by: ["status"],
      _count: true,
      _sum: { amount: true },
    }),

    // Delivery stats
    prisma.delivery.groupBy({
      by: ["status"],
      _count: true,
    }),

    // Expiring batches (within 90 days)
    prisma.batch.findMany({
      where: {
        expiryDate: { lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        status: "ACTIVE",
        quantity: { gt: 0 },
      },
      include: { product: { select: { name: true } } },
      orderBy: { expiryDate: "asc" },
      take: 10,
    }),

    // Low stock items
    prisma.product.findMany({
      where: { AND: [{ stockQuantity: { lte: 10 } }, { stockQuantity: { gt: 0 } }], isVisible: true },
      orderBy: { stockQuantity: "asc" },
      take: 10,
      select: { id: true, name: true, stockQuantity: true, minimumStock: true, sku: true },
    }),
  ]);

  const revenue = totalRevenue._sum.totalAmount || 0;
  const todayRev = todayRevenue._sum.totalAmount || 0;

  const metricCards = [
    { label: "Total Revenue", value: `$${revenue.toFixed(2)}`, icon: DollarSign, color: "bg-emerald-500", link: "/admin/reports" },
    { label: "Today's Revenue", value: `$${todayRev.toFixed(2)}`, icon: TrendingUp, color: "bg-teal-500", link: "/admin/reports" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "bg-blue-500", link: "/admin/orders" },
    { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "bg-amber-500", link: "/admin/orders" },
    { label: "Processing", value: processingOrders, icon: Package, color: "bg-indigo-500", link: "/admin/orders" },
    { label: "Delivered", value: deliveredOrders, icon: CheckCircle2, color: "bg-emerald-600", link: "/admin/orders" },
    { label: "Total Customers", value: totalCustomers, icon: Users, color: "bg-sky-500", link: "/admin/users" },
    { label: "New Today", value: newCustomersToday, icon: ArrowUpRight, color: "bg-violet-500", link: "/admin/users" },
    { label: "Products", value: totalProducts, icon: Package, color: "bg-teal-600", link: "/admin/products" },
    { label: "Out of Stock", value: outOfStockProducts, icon: XCircle, color: "bg-red-500", link: "/admin/inventory" },
    { label: "Low Stock", value: lowStockProducts, icon: AlertTriangle, color: "bg-amber-600", link: "/admin/inventory" },
    { label: "Prescriptions", value: totalPrescriptions, icon: Pill, color: "bg-pink-500", link: "/admin/prescriptions" },
    { label: "Pending Rx Review", value: pendingPrescriptions, icon: Clock, color: "bg-rose-500", link: "/admin/prescriptions" },
    { label: "Open Tickets", value: openTickets, icon: MessageSquare, color: "bg-orange-500", link: "/admin/support" },
    { label: "Active Coupons", value: activeCoupons, icon: RotateCw, color: "bg-cyan-500", link: "/admin/promotions" },
    { label: "Total Reviews", value: totalReviews, icon: Star, color: "bg-yellow-500", link: "/admin/reviews" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">SuperAdmin Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Pharmacy operations overview — real-time data</p>
      </div>

      {/* ─── METRIC CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.link} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition group">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 transition" />
              </div>
              <div className="text-xl font-extrabold text-slate-900">{card.value}</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">{card.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── PRESCRIPTION QUEUE ──────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Pill className="w-4 h-4 text-pink-500" /><span>Prescription Queue</span>
            </h2>
            <Link href="/admin/prescriptions" className="text-[10px] font-bold text-teal-700 hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <div className="text-lg font-extrabold text-amber-800">{pendingPrescriptions}</div>
              <div className="text-[10px] text-amber-600 font-medium">Awaiting Review</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <div className="text-lg font-extrabold text-emerald-800">{approvedPrescriptions}</div>
              <div className="text-[10px] text-emerald-600 font-medium">Approved (All Time)</div>
            </div>
            <div className="bg-red-50 p-3 rounded-xl border border-red-200">
              <div className="text-lg font-extrabold text-red-800">{rejectedPrescriptions}</div>
              <div className="text-[10px] text-red-600 font-medium">Rejected (All Time)</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-lg font-extrabold text-slate-800">{totalPrescriptions}</div>
              <div className="text-[10px] text-slate-600 font-medium">Total Prescriptions</div>
            </div>
          </div>
        </div>

        {/* ─── RECENT ORDERS ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-blue-500" /><span>Recent Orders</span>
            </h2>
            <Link href="/admin/orders" className="text-[10px] font-bold text-teal-700 hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No orders yet.</p>
            ) : recentOrders.map((ord) => (
              <div key={ord.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                  <span className="text-slate-400 ml-2">{ord.user.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    ord.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800" :
                    ord.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>{ord.status.replace(/_/g, " ")}</span>
                  <span className="font-bold text-slate-900">${ord.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── TOP PRODUCTS ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /><span>Top Selling Products</span>
            </h2>
            <Link href="/admin/products" className="text-[10px] font-bold text-teal-700 hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No sales data yet.</p>
            ) : topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-[9px] font-bold text-slate-600">{i + 1}</span>
                  <div>
                    <span className="font-bold text-slate-900 block">{p.name}</span>
                    <span className="text-[10px] text-slate-400">{p.salesCount} sold</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900">${p.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── INVENTORY ALERTS ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /><span>Inventory Alerts</span>
            </h2>
            <Link href="/admin/inventory" className="text-[10px] font-bold text-teal-700 hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {lowStockItems.length === 0 && expiringBatches.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No alerts.</p>
            ) : (
              <>
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1">SKU: {item.sku}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${item.stockQuantity === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                      {item.stockQuantity} units
                    </span>
                  </div>
                ))}
                {expiringBatches.slice(0, 3).map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{batch.product.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1">Batch: {batch.batchNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800">
                      Exp: {new Date(batch.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
