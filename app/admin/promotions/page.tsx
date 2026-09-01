"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tag, Plus, Edit3, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface Coupon {
  id: string; code: string; discountType: string; discountValue: number;
  minOrderAmount: number; expiresAt: string | null; isActive: boolean;
}

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "0", expiresAt: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openNew = () => { setEditing(null); setForm({ code: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "0", expiresAt: "", isActive: true }); setError(null); setShowForm(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({ code: c.code, discountType: c.discountType, discountValue: String(c.discountValue), minOrderAmount: String(c.minOrderAmount), expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "", isActive: c.isActive });
    setError(null); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const url = editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowForm(false); fetchCoupons();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try { await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" }); fetchCoupons(); } catch {}
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await fetch(`/api/admin/coupons/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) });
      setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Coupons & Promotions</h1><p className="text-xs text-slate-500 mt-1">Create and manage discount codes</p></div>
        <button onClick={openNew} className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition"><Plus className="w-3.5 h-3.5" /><span>New Coupon</span></button>
      </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">{editing ? "Edit Coupon" : "New Coupon"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="block font-bold text-slate-700 mb-1">Code *</label><input type="text" required placeholder="e.g. SUMMER20" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Type *</label><select value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed ($)</option></select></div>
                <div><label className="block font-bold text-slate-700 mb-1">Value *</label><input type="number" step="0.01" required placeholder={form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 5.00"} value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Min. Order ($)</label><input type="number" step="0.01" value={form.minOrderAmount} onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block font-bold text-slate-700 mb-1">Expiry Date</label><input type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div className="flex items-end"><label className="flex items-center space-x-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded" /><span className="font-bold">Active</span></label></div>
              </div>
              <div className="flex space-x-3">
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min. Order</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No coupons yet.</td></tr>
              ) : coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold text-teal-700 text-sm">{c.code}</td>
                  <td className="p-4 uppercase">{c.discountType}</td>
                  <td className="p-4 font-bold text-slate-900">{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`}</td>
                  <td className="p-4">${c.minOrderAmount.toFixed(2)}</td>
                  <td className="p-4 text-slate-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                  <td className="p-4"><button onClick={() => toggleActive(c)}><StatusBadge status={c.isActive ? "ACTIVE" : "INACTIVE"} /></button></td>
                  <td className="p-4 text-right space-x-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-teal-600 transition"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
}
