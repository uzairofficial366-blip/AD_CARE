"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("General");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError(null);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject || `Contact Form: ${category}`,
          category,
          priority: "Normal",
          initialMessage: `From: ${name} (${email})\n\n${message}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err: any) { setError(err.message); } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header user={null} />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Contact Us</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Have a question about your order, prescription, or account? Our pharmacy support team is here to help.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Phone, label: "Phone", value: "1-800-555-MEDS", sub: "Mon-Sat 8AM-8PM" },
            { icon: Mail, label: "Email", value: "support@adc-care.com", sub: "Response within 2 hours" },
            { icon: MapPin, label: "Address", value: "123 Health Plaza, Springfield, IL 62704", sub: "Walk-ins welcome" },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto"><Icon className="w-6 h-6" /></div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{label}</h3>
                <p className="text-xs text-slate-600 mt-1">{value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Send a Message</h2>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center space-x-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div><span className="font-bold block text-sm">Message Sent!</span>We&apos;ll get back to you within 2 hours during pharmacy hours.</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block font-bold text-slate-700 mb-1">Full Name *</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Your name" /></div>
              <div><label className="block font-bold text-slate-700 mb-1">Email *</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" placeholder="you@example.com" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block font-bold text-slate-700 mb-1">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"><option>General</option><option>Order Issue</option><option>Prescription</option><option>Billing</option><option>Product Question</option></select></div>
              <div><label className="block font-bold text-slate-700 mb-1">Subject</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Brief subject" /></div>
            </div>
            <div><label className="block font-bold text-slate-700 mb-1">Message *</label><textarea rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" placeholder="How can we help you?" /></div>
            <button type="submit" disabled={sending} className="flex items-center space-x-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50">
              <Send className="w-3.5 h-3.5" /><span>{sending ? "Sending..." : "Send Message"}</span>
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
