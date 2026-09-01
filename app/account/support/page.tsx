"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StatusBadge } from "@/components/ui/status-badge";
import { MessageSquare, PhoneCall, Mail, Plus, Send, AlertCircle, X } from "lucide-react";

interface TicketMessage {
  id: string;
  message: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  order: { orderNumber: string } | null;
  messages: TicketMessage[];
}

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Normal");
  const [initialMessage, setInitialMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    if (activeTicket) {
      const updated = tickets.find((t) => t.id === activeTicket.id);
      if (updated) setActiveTicket(updated);
    }
  }, [tickets]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket?.messages]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) {
      setError("Subject and message are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, priority, initialMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowForm(false);
      setSubject("");
      setInitialMessage("");
      await fetchTickets();
      setActiveTicket(data.ticket);
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/support/tickets/${activeTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReplyText("");
      await fetchTickets();
    } catch {} finally { setSendingReply(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header user={null} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-teal-600" />
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Customer Support</h1>
              <p className="text-xs text-slate-500 mt-0.5">Get help with orders, prescriptions, or account questions</p>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition">
            <Plus className="w-3.5 h-3.5" /><span>New Ticket</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0"><PhoneCall className="w-5 h-5" /></div>
            <div><span className="font-bold text-slate-900 block">Phone Support</span><span className="text-slate-500">1-800-555-MEDS</span></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0"><Mail className="w-5 h-5" /></div>
            <div><span className="font-bold text-slate-900 block">Email Support</span><span className="text-slate-500">support@adc-care.com</span></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0"><MessageSquare className="w-5 h-5" /></div>
            <div><span className="font-bold text-slate-900 block">Response Time</span><span className="text-slate-500">Under 2 hours</span></div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Create Support Ticket</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <input type="text" required placeholder="Brief description of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg">
                    <option>General</option><option>Order Issue</option><option>Prescription</option><option>Billing</option><option>Product Question</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg">
                    <option>Low</option><option>Normal</option><option>High</option><option>Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Message *</label>
                <textarea rows={4} required placeholder="Describe your issue in detail..." value={initialMessage} onChange={(e) => setInitialMessage(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" />
              </div>
              <div className="flex space-x-3">
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50">{saving ? "Submitting..." : "Submit Ticket"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${activeTicket ? "hidden lg:block" : ""} lg:col-span-1 space-y-2`}>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Your Tickets ({tickets.length})</h2>
            {loading ? <p className="text-xs text-slate-400 px-1">Loading...</p> : tickets.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-1">No tickets yet. Create one to get help.</p>
            ) : tickets.map((t) => (
              <button key={t.id} onClick={() => setActiveTicket(t)} className={`w-full text-left p-3 rounded-xl border text-xs transition ${activeTicket?.id === t.id ? "bg-teal-50 border-teal-300" : "bg-white border-slate-200 hover:border-teal-300"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-teal-700">{t.ticketNumber}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="font-bold text-slate-900 truncate">{t.subject}</p>
                <p className="text-slate-400 mt-0.5">{t.messages.length} message{t.messages.length !== 1 ? "s" : ""} • {new Date(t.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>

          <div className={`${activeTicket ? "" : "hidden lg:block"} lg:col-span-2`}>
            {!activeTicket ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Select a ticket or create a new one to view the conversation.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[600px]">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-teal-700 text-xs">{activeTicket.ticketNumber}</span>
                      <StatusBadge status={activeTicket.status} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{activeTicket.subject}</h3>
                    <p className="text-[11px] text-slate-400">{activeTicket.category} • {activeTicket.priority} priority</p>
                  </div>
                  <button onClick={() => setActiveTicket(null)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeTicket.messages.map((m) => (
                    <div key={m.id} className={`max-w-[80%] p-3 rounded-xl text-xs ${m.sender.role === "CUSTOMER" ? "ml-auto bg-teal-600 text-white" : "bg-slate-100 border border-slate-200"}`}>
                      <div className={`flex justify-between font-bold mb-1 text-[10px] ${m.sender.role === "CUSTOMER" ? "text-teal-100" : "text-slate-500"}`}>
                        <span>{m.sender.name}</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className={m.sender.role === "CUSTOMER" ? "text-white" : "text-slate-700"}>{m.message}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {activeTicket.status !== "CLOSED" && (
                  <form onSubmit={handleReply} className="p-4 border-t border-slate-200 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button type="submit" disabled={sendingReply || !replyText.trim()} className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition disabled:opacity-50">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
