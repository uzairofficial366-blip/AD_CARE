"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pill, Eye, EyeOff, Plus, Search, Edit3, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface Product {
  id: string; name: string; slug: string; description: string; sku: string;
  price: number; salePrice: number | null; stockQuantity: number;
  isPrescriptionRequired: boolean; dosageForm: string | null;
  activeIngredients: string | null; usageInstructions: string | null;
  warnings: string | null; imageUrl: string | null;
  categoryId: string; brandId: string | null;
  isFeatured: boolean; isVisible: boolean;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
}

interface SelectOption { id: string; name: string; slug?: string }

const EMPTY_FORM = {
  name: "", description: "", sku: "", price: "", salePrice: "",
  stockQuantity: "0", isPrescriptionRequired: false, dosageForm: "",
  activeIngredients: "", usageInstructions: "", warnings: "",
  imageUrl: "", categoryId: "", brandId: "", isFeatured: false, isVisible: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      const bData = await bRes.json();
      setProducts(pData.products || []);
      setCategories(cData.categories || cData || []);
      setBrands(bData.brands || bData || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/products/toggle-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isVisible: !current }),
      });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isVisible: !current } : p));
    } catch {}
  };

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setError(null); setSuccess(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, sku: p.sku,
      price: String(p.price), salePrice: p.salePrice ? String(p.salePrice) : "",
      stockQuantity: String(p.stockQuantity), isPrescriptionRequired: p.isPrescriptionRequired,
      dosageForm: p.dosageForm || "", activeIngredients: p.activeIngredients || "",
      usageInstructions: p.usageInstructions || "", warnings: p.warnings || "",
      imageUrl: p.imageUrl || "", categoryId: p.categoryId, brandId: p.brandId || "",
      isFeatured: p.isFeatured, isVisible: p.isVisible,
    });
    setError(null); setSuccess(null); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(editing ? "Product updated!" : "Product created!");
      fetchAll();
      if (!editing) setShowForm(false);
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const updateField = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Product Management</h1>
            <p className="text-xs text-slate-500 mt-1">Create, edit, and manage your product catalog</p>
          </div>
          <div className="flex items-center space-x-3">
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg w-48" />
            <button onClick={openNew} className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition">
              <Plus className="w-3.5 h-3.5" /><span>Add Product</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">{editing ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
            {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center space-x-2 mb-4"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{success}</span></div>}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2"><label className="block font-bold text-slate-700 mb-1">Name *</label><input type="text" required value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">SKU *</label><input type="text" required value={form.sku} onChange={(e) => updateField("sku", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
              </div>
              <div><label className="block font-bold text-slate-700 mb-1">Description *</label><textarea rows={3} required value={form.description} onChange={(e) => updateField("description", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div><label className="block font-bold text-slate-700 mb-1">Price *</label><input type="number" step="0.01" required value={form.price} onChange={(e) => updateField("price", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Sale Price</label><input type="number" step="0.01" value={form.salePrice} onChange={(e) => updateField("salePrice", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Stock</label><input type="number" value={form.stockQuantity} onChange={(e) => updateField("stockQuantity", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Category *</label><select required value={form.categoryId} onChange={(e) => updateField("categoryId", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"><option value="">Select</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block font-bold text-slate-700 mb-1">Brand</label><select value={form.brandId} onChange={(e) => updateField("brandId", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"><option value="">None</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="block font-bold text-slate-700 mb-1">Dosage Form</label><input type="text" placeholder="e.g. Tablet" value={form.dosageForm} onChange={(e) => updateField("dosageForm", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Image URL</label><input type="url" value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div className="flex items-end space-x-4">
                  <label className="flex items-center space-x-2"><input type="checkbox" checked={form.isPrescriptionRequired} onChange={(e) => updateField("isPrescriptionRequired", e.target.checked)} className="rounded" /><span className="font-bold">Rx Required</span></label>
                  <label className="flex items-center space-x-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField("isFeatured", e.target.checked)} className="rounded" /><span className="font-bold">Featured</span></label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block font-bold text-slate-700 mb-1">Active Ingredients</label><input type="text" value={form.activeIngredients} onChange={(e) => updateField("activeIngredients", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Warnings</label><input type="text" value={form.warnings} onChange={(e) => updateField("warnings", e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
              </div>
              <div className="flex space-x-3">
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50">{saving ? "Saving..." : editing ? "Update Product" : "Create Product"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Rx</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Visible</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No products found.</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4"><div className="font-bold text-slate-900">{p.name}</div><div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</div></td>
                    <td className="p-4 text-slate-600">{p.category?.name || "—"}</td>
                    <td className="p-4">{p.isPrescriptionRequired ? <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">Rx</span> : <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">OTC</span>}</td>
                    <td className="p-4 font-bold text-slate-900">${p.price.toFixed(2)}{p.salePrice && <span className="text-[10px] text-red-600 block">Sale: ${p.salePrice.toFixed(2)}</span>}</td>
                    <td className="p-4"><span className={`font-bold ${p.stockQuantity <= 10 ? "text-red-600" : "text-emerald-700"}`}>{p.stockQuantity}</span></td>
                    <td className="p-4"><button onClick={() => toggleVisibility(p.id, p.isVisible)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${p.isVisible ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>{p.isVisible ? <><Eye className="w-3 h-3" /><span>Yes</span></> : <><EyeOff className="w-3 h-3" /><span>No</span></>}</button></td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-teal-600 transition"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
