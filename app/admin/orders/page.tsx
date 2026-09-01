"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Save, RefreshCw, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryAgentName: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
  user: { name: string; email: string };
  items: { productName: string; quantity: number; totalPrice: number }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  const fetchOrders = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/orders/list");
      if (!res.ok) {
        // Fallback: fetch from Prisma directly via page refresh
        window.location.reload();
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { setError("Failed to load orders"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    setSaving(orderId); setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...updates } : o));
    } catch (err: any) { setError(err.message); } finally { setSaving(null); }
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Orders & Delivery Management</h1>
            <p className="text-xs text-slate-500 mt-1">Manage order statuses, delivery agents, and fulfillment</p>
          </div>
          <button onClick={fetchOrders} disabled={loading} className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "PROCESSING", "PRESCRIPTION_VERIFICATION", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${filter === s ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}>
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Delivery Agent</th>
                  <th className="p-3">Est. Delivery</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">Loading orders...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">No orders found.</td></tr>
                ) : filtered.map((ord) => (
                  <OrderRow key={ord.id} order={ord} saving={saving === ord.id} onUpdate={updateOrder} />
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order: initial, saving, onUpdate }: { order: Order; saving: boolean; onUpdate: (id: string, updates: Partial<Order>) => Promise<void> }) {
  const [order, setOrder] = useState(initial);
  const [agent, setAgent] = useState(order.deliveryAgentName || "");
  const [delivery, setDelivery] = useState(order.estimatedDelivery || "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setAgent(order.deliveryAgentName || ""); setDelivery(order.estimatedDelivery || ""); }, [order]);

  const handleSave = async () => {
    await onUpdate(order.id, { status: order.status, deliveryAgentName: agent || null, estimatedDelivery: delivery || null });
    setDirty(false);
  };

  const statusOptions = ["PENDING", "PROCESSING", "PRESCRIPTION_VERIFICATION", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="p-3">
        <span className="font-bold text-slate-900 block">{order.orderNumber}</span>
        <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
      </td>
      <td className="p-3">
        <div className="font-bold text-slate-800">{order.user.name}</div>
        <div className="text-[10px] text-slate-400">{order.user.email}</div>
      </td>
      <td className="p-3">
        <select value={order.status} onChange={(e) => { setOrder({ ...order, status: e.target.value }); setDirty(true); }} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold uppercase">
          {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </td>
      <td className="p-3">
        <span className="font-bold text-slate-800">{order.paymentMethod}</span>
        <span className="text-[10px] text-slate-500 block">({order.paymentStatus})</span>
      </td>
      <td className="p-3">
        <input value={agent} onChange={(e) => { setAgent(e.target.value); setDirty(true); }} placeholder="Agent name" className="w-32 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px]" />
      </td>
      <td className="p-3">
        <input value={delivery} onChange={(e) => { setDelivery(e.target.value); setDirty(true); }} placeholder="e.g. 3-5 days" className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px]" />
      </td>
      <td className="p-3 text-right font-extrabold text-sm text-slate-900">${order.totalAmount.toFixed(2)}</td>
      <td className="p-3">
        {dirty && (
          <button onClick={handleSave} disabled={saving} className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50">
            <Save className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}
