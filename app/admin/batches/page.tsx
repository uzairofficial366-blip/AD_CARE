"use client";

import { useState, useEffect } from "react";
import { Plus, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface Batch { id: string; batchNumber: string; quantity: number; reservedQuantity: number; expiryDate: string; costPrice: number | null; sellingPrice: number | null; status: string; receivedAt: string; product: { name: string; sku: string }; supplier: { name: string } | null }

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBatches(); }, []);

  const now = new Date();
  const filtered = batches.filter((b) => {
    if (filter === "ALL") return true;
    if (filter === "EXPIRING_30") {
      const exp = new Date(b.expiryDate);
      const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30 && diff > 0 && b.status === "ACTIVE";
    }
    if (filter === "EXPIRING_90") {
      const exp = new Date(b.expiryDate);
      const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 90 && diff > 0 && b.status === "ACTIVE";
    }
    if (filter === "EXPIRED") return new Date(b.expiryDate) < now && b.status !== "EXPIRED";
    if (filter === "LOW_STOCK") return b.quantity <= 10 && b.status === "ACTIVE";
    return b.status === filter;
  });

  const getExpiryColor = (date: string) => {
    const diff = (new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "bg-red-100 text-red-800";
    if (diff <= 30) return "bg-red-100 text-red-800";
    if (diff <= 60) return "bg-amber-100 text-amber-800";
    if (diff <= 90) return "bg-yellow-100 text-yellow-800";
    return "bg-emerald-100 text-emerald-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Batches & Expiry</h1><p className="text-xs text-slate-500 mt-1">Track inventory batches, expiry dates, and FEFO compliance</p></div>
        <button onClick={fetchBatches} disabled={loading} className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span></button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["ALL", "ACTIVE", "EXPIRING_30", "EXPIRING_90", "EXPIRED", "LOW_STOCK", "DEPLETED", "DAMAGED"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${filter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}>
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Product</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Batch #</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Supplier</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Qty</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Reserved</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Expiry</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No batches found.</td></tr> : filtered.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="font-bold text-slate-900">{b.product.name}</div><div className="text-[10px] text-slate-400 font-mono">SKU: {b.product.sku}</div></td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-600">{b.batchNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{b.supplier?.name || "—"}</td>
                  <td className="px-4 py-3 text-right font-bold">{b.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{b.reservedQuantity}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getExpiryColor(b.expiryDate)}`}>{new Date(b.expiryDate).toLocaleDateString()}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${b.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
