"use client";

import { useState, useEffect } from "react";
import { Truck, User, Phone, CheckCircle2, Clock, MapPin, RefreshCw } from "lucide-react";

interface Delivery { id: string; status: string; trackingNumber: string | null; assignedAt: string | null; outForDeliveryAt: string | null; deliveredAt: string | null; order: { orderNumber: string; totalAmount: number; shippingAddressJson: string; user: { name: string } }; agent: { name: string; phone: string } | null }

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchDeliveries = async () => { setLoading(true); try { const res = await fetch("/api/admin/deliveries"); const data = await res.json(); setDeliveries(data.deliveries || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchDeliveries(); }, []);

  const filtered = filter === "ALL" ? deliveries : deliveries.filter((d) => d.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Deliveries</h1><p className="text-xs text-slate-500 mt-1">Track and manage delivery assignments</p></div>
        <button onClick={fetchDeliveries} disabled={loading} className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {["ALL", "AWAITING_ASSIGNMENT", "ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${filter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}>{f.replace(/_/g, " ")}</button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Order</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Customer</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Agent</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Tracking</th>
            <th className="text-right px-4 py-3 font-bold text-slate-600">Amount</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No deliveries.</td></tr> : filtered.map((d) => (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">{d.order.orderNumber}</td>
                <td className="px-4 py-3 text-slate-600">{d.order.user.name}</td>
                <td className="px-4 py-3">{d.agent ? <div><div className="font-bold text-slate-800">{d.agent.name}</div><div className="text-[10px] text-slate-400">{d.agent.phone}</div></div> : <span className="text-slate-300">Unassigned</span>}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${d.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800" : d.status === "FAILED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{d.status.replace(/_/g, " ")}</span></td>
                <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{d.trackingNumber || "—"}</td>
                <td className="px-4 py-3 text-right font-bold">${d.order.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
