"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, UserCheck, UserX, AlertCircle } from "lucide-react";

interface User {
  id: string; name: string; email: string; role: string;
  phone: string | null; isActive: boolean; createdAt: string;
  _count: { orders: number; reviews: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (userId: string, role: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    } catch (err: any) { alert(err.message); }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !isActive } : u));
    } catch (err: any) { alert(err.message); }
  };

  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div><h1 className="text-2xl font-extrabold text-slate-900">User Management</h1><p className="text-xs text-slate-500 mt-1">View and manage customer and staff accounts</p></div>
          <div className="flex items-center space-x-2 text-xs">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-700">{users.length} total</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["ALL", "ADMIN", "PHARMACIST", "CUSTOMER"].map((r) => (
            <button key={r} onClick={() => setFilter(r)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${filter === r ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}>
              {r === "ALL" ? "All Users" : r}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No users found.</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-4"><div className="font-bold text-slate-900">{u.name}</div><div className="text-[10px] text-slate-400">{u.email}</div></td>
                    <td className="p-4">
                      <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)} className="text-[10px] font-bold bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 uppercase">
                        <option value="CUSTOMER">Customer</option>
                        <option value="PHARMACIST">Pharmacist</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-500">{u.phone || "—"}</td>
                    <td className="p-4 font-bold text-slate-700">{u._count.orders}</td>
                    <td className="p-4">
                      <button onClick={() => toggleActive(u.id, u.isActive)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        {u.isActive ? <><UserCheck className="w-3 h-3" /><span>Active</span></> : <><UserX className="w-3 h-3" /><span>Inactive</span></>}
                      </button>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-800" : u.role === "PHARMACIST" ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                        <ShieldCheck className="w-3 h-3" /><span>{u.role}</span>
                      </span>
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
