"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-lg font-bold text-slate-900">Forgot Password</h1>
          <p className="text-xs text-slate-500">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-sm"><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span>Check Your Email</span></div>
            <p>If an account exists with <strong>{email}</strong>, a password reset link has been sent. Check your inbox and spam folder.</p>
            <Link href="/login" className="inline-block mt-2 font-bold text-teal-700 hover:underline">← Back to Login</Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-xs disabled:opacity-50">
                <Send className="w-3.5 h-3.5" /><span>{loading ? "Sending..." : "Send Reset Link"}</span>
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
