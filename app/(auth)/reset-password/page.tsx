"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) setTokenError(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-lg font-bold text-slate-900">Invalid Reset Link</h1>
          <p className="text-xs text-slate-500">This password reset link is invalid or missing a token.</p>
          <Link href="/forgot-password" className="inline-block px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition">Request New Link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-lg font-bold text-slate-900">Reset Password</h1>
          <p className="text-xs text-slate-500">Enter your new password below.</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-sm"><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span>Password Reset!</span></div>
            <p>Your password has been updated successfully.</p>
            <Link href="/login" className="inline-block mt-2 font-bold text-teal-700 hover:underline">Sign In Now →</Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required minLength={10} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Min 10 chars, 1 letter + 1 number" />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Re-enter password" />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition text-xs disabled:opacity-50">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        <div className="text-center text-xs text-slate-500">
          <Link href="/login" className="font-bold text-teal-700 hover:underline flex items-center justify-center space-x-1">
            <ArrowLeft className="w-3 h-3" /><span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-sm text-slate-500">Loading...</div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
