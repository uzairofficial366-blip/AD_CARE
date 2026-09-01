"use client";

import { useState, useEffect } from "react";
import { Clock, User, Package, RefreshCw } from "lucide-react";

interface Refill { id: string; nextRefillDate: string; frequencyDays: number; isActive: boolean; notes: string | null; product: { name: string; sku: string }; user: { name: string; email: string } }

export default function AdminRefillsPage() {
  const [refills, setRefills] = useState<Refill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRefills = async () => { setLoading(true); try { const res = await fetch("/api/admin/refills"); const data = await res.json(); setRefills(data.refills || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchRefills(); }, []);

  const now = new Date();
  const upcoming = refills.filter((r) => r.isActive && new Date(r.nextRefillDate) > now);
  const overdue = refills.filter((r) => r.isActive && new Date(r.nextRefillDate) <= now);
  const inactive = refills.filter((r) => !r.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Refill Reminders</h1><p className="text-xs text-slate-500 mt-1">Manage medication refill schedules</p></div>
        <button onClick={fetchRefills} disabled={loading} className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overdue</div><div className="text-2xl font-extrabold text-red-600 mt-1">{overdue.length}</div></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upcoming</div><div className="text-2xl font-extrabold text-amber-600 mt-1">{upcoming.length}</div></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inactive</div><div className="text-2xl font-extrabold text-slate-400 mt-1">{inactive.length}</div></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Customer</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Product</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Next Refill</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Frequency</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> : refills.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No refills.</td></tr> : refills.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><div className="font-bold text-slate-900">{r.user.name}</div><div className="text-[10px] text-slate-400">{r.user.email}</div></td>
                <td className="px-4 py-3 font-bold text-slate-800">{r.product.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${new Date(r.nextRefillDate) <= now ? "bg-red-100 text-red-800" : new Date(r.nextRefillDate).getTime() - now.getTime() < 7 * 86400000 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{new Date(r.nextRefillDate).toLocaleDateString()}</span></td>
                <td className="px-4 py-3 text-center text-slate-600">{r.frequencyDays}d</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{r.isActive ? "ACTIVE" : "INACTIVE"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
