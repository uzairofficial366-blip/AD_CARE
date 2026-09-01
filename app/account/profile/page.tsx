"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { User, Mail, Phone, Lock, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AccountProfilePage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; phone: string | null; role: string; createdAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/profile").then((r) => r.json()).then((data) => {
      if (data.user) { setUser(data.user); setName(data.user.name); setPhone(data.user.phone || ""); }
      setLoading(false);
    });
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user); setSuccess("Profile updated successfully.");
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match."); return; }
    setChangingPassword(true); setPwError(null); setPwSuccess(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPwSuccess("Password changed successfully."); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) { setPwError(err.message); } finally { setChangingPassword(false); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col font-sans"><Header /><main className="flex-1 flex items-center justify-center text-sm text-slate-500">Loading profile...</main><Footer /></div>;
  if (!user) return <div className="min-h-screen bg-slate-50 flex flex-col font-sans"><Header /><main className="flex-1 flex items-center justify-center text-sm text-slate-500">Could not load profile.</main><Footer /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Account Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your profile and security settings</p>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><User className="w-4 h-4 text-teal-600" /><span>Profile Information</span></h2>
          <div className="text-xs text-slate-500">Member since {new Date(user.createdAt).toLocaleDateString()} &bull; {user.role}</div>

          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center space-x-2"><CheckCircle2 className="w-4 h-4" /><span>{success}</span></div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>}

          <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative"><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /><User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" /></div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email (cannot be changed)</label>
              <div className="relative"><input type="email" disabled value={user.email} className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500" /><Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" /></div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <div className="relative"><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" placeholder="+1-555-0123" /><Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" /></div>
            </div>
            <button type="submit" disabled={saving} className="flex items-center space-x-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /><span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2"><Lock className="w-4 h-4 text-teal-600" /><span>Change Password</span></h2>

          {pwSuccess && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center space-x-2"><CheckCircle2 className="w-4 h-4" /><span>{pwSuccess}</span></div>}
          {pwError && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2"><AlertCircle className="w-4 h-4" /><span>{pwError}</span></div>}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <div className="relative"><input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /><Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" /></div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <div className="relative"><input type="password" required minLength={10} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Min 10 chars, 1 letter + 1 number" /><Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" /></div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative"><input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" /><Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" /></div>
            </div>
            <button type="submit" disabled={changingPassword} className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition disabled:opacity-50">
              <Lock className="w-3.5 h-3.5" /><span>{changingPassword ? "Changing..." : "Change Password"}</span>
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
