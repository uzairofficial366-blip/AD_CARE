"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";

interface Payment { id: string; amount: number; currency: string; paymentMethod: string; status: string; transactionId: string | null; createdAt: string; order: { orderNumber: string }; user: { name: string; email: string } }

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchPayments = async () => { setLoading(true); try { const res = await fetch("/api/admin/payments"); const data = await res.json(); setPayments(data.payments || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchPayments(); }, []);

  const filtered = filter === "ALL" ? payments : payments.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Payments</h1><p className="text-xs text-slate-500 mt-1">Track payment transactions and refunds</p></div>
        <button onClick={fetchPayments} disabled={loading} className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${filter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}>{f.replace(/_/g, " ")}</button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Order</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Customer</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Method</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Transaction ID</th>
            <th className="text-right px-4 py-3 font-bold text-slate-600">Amount</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No payments.</td></tr> : filtered.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">{p.order.orderNumber}</td>
                <td className="px-4 py-3"><div className="font-bold text-slate-800">{p.user.name}</div><div className="text-[10px] text-slate-400">{p.user.email}</div></td>
                <td className="px-4 py-3 text-slate-600">{p.paymentMethod}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${p.status === "PAID" ? "bg-emerald-100 text-emerald-800" : p.status === "FAILED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{p.status}</span></td>
                <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{p.transactionId || "—"}</td>
                <td className="px-4 py-3 text-right font-bold">${p.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
