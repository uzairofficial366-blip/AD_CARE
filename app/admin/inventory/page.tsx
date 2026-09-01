"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  dosageForm: string | null;
  category: { name: string };
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts((data.products || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku, stockQuantity: p.stockQuantity, dosageForm: p.dosageForm, category: p.category })));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const updateStock = async (productId: string, newQty: number) => {
    setSaving(productId);
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newQty }),
      });
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stockQuantity: newQty } : p));
    } catch {} finally { setSaving(null); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Inventory & Stock Control</h1>
          <p className="text-xs text-slate-500 mt-1">Track and update medicine stock quantities</p>
        </div>
        <button onClick={fetchProducts} disabled={loading} className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span>
        </button>
      </div>

        <div className="relative max-w-sm">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Product & SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Dosage Form</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-right">Quantity</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading inventory...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">No products found.</td></tr>
                ) : filtered.map((p) => (
                  <InventoryRow key={p.id} product={p} saving={saving === p.id} onUpdate={updateStock} />
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function InventoryRow({ product: initial, saving, onUpdate }: { product: Product; saving: boolean; onUpdate: (id: string, qty: number) => Promise<void> }) {
  const [product, setProduct] = useState(initial);
  const [qty, setQty] = useState(initial.stockQuantity);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setQty(product.stockQuantity); }, [product]);

  const handleSave = async () => {
    await onUpdate(product.id, qty);
    setProduct({ ...product, stockQuantity: qty });
    setDirty(false);
  };

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="p-4">
        <span className="font-bold text-slate-900 block">{product.name}</span>
        <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</span>
      </td>
      <td className="p-4 text-slate-600">{product.category.name}</td>
      <td className="p-4 font-mono text-[10px]">{product.dosageForm || "N/A"}</td>
      <td className="p-4">
        {qty <= 10 ? (
          <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center w-fit">
            <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />Low Stock
          </span>
        ) : (
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center w-fit">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />In Stock
          </span>
        )}
      </td>
      <td className="p-4 text-right">
        <input type="number" min={0} value={qty} onChange={(e) => { setQty(parseInt(e.target.value) || 0); setDirty(true); }} className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-right" />
      </td>
      <td className="p-4">
        {dirty && (
          <button onClick={handleSave} disabled={saving} className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50">
            <Save className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}
