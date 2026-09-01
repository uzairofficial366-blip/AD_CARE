"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, AlertCircle } from "lucide-react";

interface Category { id: string; name: string; slug: string; description: string | null; isVisible: boolean; parentId: string | null; _count: { products: number } }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    setError(null);
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowForm(false); setEditing(null); setName(""); setDescription("");
      fetchCategories();
    } catch (err: any) { setError(err.message); }
  };

  const toggleVisibility = async (cat: Category) => {
    try {
      await fetch(`/api/admin/categories/${cat.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isVisible: !cat.isVisible }) });
      fetchCategories();
    } catch {}
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Products will need reassignment.")) return;
    try { await fetch(`/api/admin/categories/${id}`, { method: "DELETE" }); fetchCategories(); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Categories</h1>
          <p className="text-xs text-slate-500 mt-1">Manage product categories</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setName(""); setDescription(""); }} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1">
          <Plus className="w-3.5 h-3.5" /><span>Add Category</span>
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>}

      {(showForm || editing) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">{editing ? "Edit Category" : "New Category"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div><label className="block font-bold text-slate-700 mb-1">Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
            <div><label className="block font-bold text-slate-700 mb-1">Description</label><input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /></div>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleSave} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1"><Save className="w-3.5 h-3.5" /><span>Save</span></button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Slug</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Products</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Visible</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No categories.</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">{cat.name}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">{cat.slug}</td>
                <td className="px-4 py-3 text-slate-600">{cat._count.products}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleVisibility(cat)} className="p-1 rounded hover:bg-slate-100">
                    {cat.isVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <button onClick={() => { setEditing(cat); setName(cat.name); setDescription(cat.description || ""); setShowForm(true); }} className="p-1 rounded hover:bg-slate-100"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
