"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StatusBadge } from "@/components/ui/status-badge";
import { RotateCw, Pill, Calendar, ShoppingBag, Trash2, Plus, AlertCircle, CheckCircle2 } from "lucide-react";

interface Reminder {
  id: string;
  frequencyDays: number;
  nextRefillDate: string;
  notes: string | null;
  isActive: boolean;
  product: { id: string; name: string; sku: string; imageUrl: string | null };
}

export default function RefillRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [frequencyDays, setFrequencyDays] = useState("30");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/refill-reminders");
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  useEffect(() => {
    if (productSearch.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}`);
        const data = await res.json();
        setSearchResults(data.products?.slice(0, 5) || []);
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { setError("Please select a product."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/refill-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, frequencyDays, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowForm(false);
      setProductSearch("");
      setProductId("");
      setFrequencyDays("30");
      setNotes("");
      fetchReminders();
    } catch (err: any) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reminder?")) return;
    try {
      await fetch(`/api/refill-reminders/${id}`, { method: "DELETE" });
      fetchReminders();
    } catch {}
  };

  const selectedProduct = searchResults.find((p) => p.id === productId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header user={null} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RotateCw className="w-6 h-6 text-teal-600" />
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Refill Reminders</h1>
              <p className="text-xs text-slate-500 mt-0.5">Automated refill schedules for your medications</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reminder</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Create Refill Reminder</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Search Product *</label>
                <input
                  type="text"
                  placeholder="Type product name..."
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setProductId(""); }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
                {searchResults.length > 0 && !productId && (
                  <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setProductId(p.id); setProductSearch(p.name); setSearchResults([]); }}
                        className="w-full text-left px-3 py-2 hover:bg-teal-50 flex items-center space-x-2 text-xs"
                      >
                        <Pill className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">{p.name}</span>
                        <span className="text-slate-400 ml-auto">${(p.salePrice || p.price).toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedProduct && (
                  <p className="mt-1 text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected: {selectedProduct.name}</span>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Refill Every (Days) *</label>
                  <select value={frequencyDays} onChange={(e) => setFrequencyDays(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg">
                    <option value="7">Every 7 days</option>
                    <option value="14">Every 14 days</option>
                    <option value="30">Every 30 days</option>
                    <option value="60">Every 60 days</option>
                    <option value="90">Every 90 days</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes</label>
                  <input type="text" placeholder="Optional reminder note" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div className="flex space-x-3">
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50">
                  {saving ? "Creating..." : "Create Reminder"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <RotateCw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-800">No Active Refill Schedules</h2>
            <p className="text-xs text-slate-500 mt-1">Create a reminder from any product page or use the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((rem) => (
              <div key={rem.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5 rotate-45" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{rem.product.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">SKU: {rem.product.sku}</span>
                    </div>
                  </div>
                  <StatusBadge status={rem.isActive ? "ACTIVE" : "INACTIVE"} />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-700">
                  <div className="flex justify-between">
                    <span>Frequency:</span>
                    <strong className="text-slate-900">Every {rem.frequencyDays} days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Refill:</span>
                    <strong className="text-teal-700">{new Date(rem.nextRefillDate).toLocaleDateString()}</strong>
                  </div>
                  {rem.notes && <p className="italic text-slate-500 pt-1">&quot;{rem.notes}&quot;</p>}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a href={`/products/${rem.product.id}`} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </a>
                  <button onClick={() => handleDelete(rem.id)} className="p-2 text-slate-400 hover:text-red-600 transition" title="Delete reminder">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
