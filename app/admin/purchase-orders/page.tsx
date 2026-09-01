"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface PurchaseOrder { id: string; orderNumber: string; status: string; totalAmount: number; createdAt: string; supplier: { name: string }; items: { productId: string; quantity: number; unitCost: number }[] }

export default function AdminPurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchOrders = async () => { setLoading(true); try { const res = await fetch("/api/admin/purchase-orders"); const data = await res.json(); setOrders(data.purchaseOrders || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchOrders(); }, []);

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Purchase Orders</h1><p className="text-xs text-slate-500 mt-1">Track supplier orders and inventory replenishment</p></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {["ALL", "DRAFT", "SENT", "CONFIRMED", "RECEIVED", "CANCELLED"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${filter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}>{f}</button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">PO #</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Supplier</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Items</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Created</th>
            <th className="text-right px-4 py-3 font-bold text-slate-600">Total</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No purchase orders.</td></tr> : filtered.map((po) => (
              <tr key={po.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-[10px] font-bold text-slate-900">{po.orderNumber}</td>
                <td className="px-4 py-3 font-bold text-slate-800">{po.supplier.name}</td>
                <td className="px-4 py-3 text-slate-600">{po.items.length} item{po.items.length !== 1 ? "s" : ""}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${po.status === "RECEIVED" ? "bg-emerald-100 text-emerald-800" : po.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{po.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right font-bold">${po.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
