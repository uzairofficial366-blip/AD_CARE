"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, AlertCircle } from "lucide-react";

interface Supplier { id: string; name: string; contactPerson: string | null; email: string | null; phone: string | null; isActive: boolean; _count: { batches: number; purchaseOrders: number } }

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [name, setName] = useState(""); const [contactPerson, setContactPerson] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => { setLoading(true); try { const res = await fetch("/api/admin/suppliers"); const data = await res.json(); setSuppliers(data.suppliers || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchSuppliers(); }, []);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name required."); return; }
    setError(null);
    try {
      const url = editing ? `/api/admin/suppliers/${editing.id}` : "/api/admin/suppliers";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, contactPerson, email, phone }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      setShowForm(false); setEditing(null); setName(""); setContactPerson(""); setEmail(""); setPhone(""); fetchSuppliers();
    } catch (err: any) { setError(err.message); }
  };

  const deleteSupplier = async (id: string) => { if (!confirm("Delete supplier?")) return; try { await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" }); fetchSuppliers(); } catch {} };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Suppliers</h1><p className="text-xs text-slate-500 mt-1">Manage pharmaceutical suppliers</p></div>
        <button onClick={() => { setShowForm(true); setEditing(null); setName(""); setContactPerson(""); setEmail(""); setPhone(""); }} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1"><Plus className="w-3.5 h-3.5" /><span>Add Supplier</span></button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>}
      {(showForm || editing) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">{editing ? "Edit Supplier" : "New Supplier"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div><label className="block font-bold text-slate-700 mb-1">Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
            <div><label className="block font-bold text-slate-700 mb-1">Contact Person</label><input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
            <div><label className="block font-bold text-slate-700 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
            <div><label className="block font-bold text-slate-700 mb-1">Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleSave} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1"><Save className="w-3.5 h-3.5" /><span>Save</span></button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">Cancel</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="text-left px-4 py-3 font-bold text-slate-600">Name</th><th className="text-left px-4 py-3 font-bold text-slate-600">Contact</th><th className="text-left px-4 py-3 font-bold text-slate-600">Email</th><th className="text-left px-4 py-3 font-bold text-slate-600">Phone</th><th className="text-left px-4 py-3 font-bold text-slate-600">Batches</th><th className="text-left px-4 py-3 font-bold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> : suppliers.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No suppliers.</td></tr> : suppliers.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.contactPerson || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{s.email || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{s.phone || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{s._count.batches}</td>
                <td className="px-4 py-3"><div className="flex items-center space-x-1">
                  <button onClick={() => { setEditing(s); setName(s.name); setContactPerson(s.contactPerson || ""); setEmail(s.email || ""); setPhone(s.phone || ""); setShowForm(true); }} className="p-1 rounded hover:bg-slate-100"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                  <button onClick={() => deleteSupplier(s.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
