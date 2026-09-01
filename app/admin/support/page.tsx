"use client";

import { useEffect, useState, useRef } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { MessageSquare, AlertCircle, Send, X } from "lucide-react";

interface TicketMessage {
  id: string; message: string; createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface Ticket {
  id: string; ticketNumber: string; subject: string; category: string;
  status: string; priority: string; createdAt: string;
  user: { id: string; name: string; email: string };
  order: { orderNumber: string } | null;
  messages: TicketMessage[];
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket?.messages]);

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      await fetch("/api/admin/support", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status }),
      });
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
      if (activeTicket?.id === ticketId) setActiveTicket((prev) => prev ? { ...prev, status } : null);
    } catch {}
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${activeTicket.id}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReplyText("");
      await fetchTickets();
    } catch {} finally { setSending(false); }
  };

  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Support Desk</h1><p className="text-xs text-slate-500 mt-1">Manage all customer support tickets</p></div>
      </div>

        <div className="flex flex-wrap gap-2">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${filter === s ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}>
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${activeTicket ? "hidden lg:block" : ""} lg:col-span-1 space-y-2`}>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Tickets ({filtered.length})</h2>
            {loading ? <p className="text-xs text-slate-400 px-1">Loading...</p> : filtered.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-1">No tickets.</p>
            ) : filtered.map((t) => (
              <button key={t.id} onClick={() => setActiveTicket(t)} className={`w-full text-left p-3 rounded-xl border text-xs transition ${activeTicket?.id === t.id ? "bg-teal-50 border-teal-300" : "bg-white border-slate-200 hover:border-teal-300"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-teal-700">{t.ticketNumber}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="font-bold text-slate-900 truncate">{t.subject}</p>
                <p className="text-slate-400 mt-0.5">{t.user.name} • {t.messages.length} msgs</p>
              </button>
            ))}
          </div>

          <div className={`${activeTicket ? "" : "hidden lg:block"} lg:col-span-2`}>
            {!activeTicket ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Select a ticket to view the conversation.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[600px]">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-teal-700 text-xs">{activeTicket.ticketNumber}</span>
                        <StatusBadge status={activeTicket.status} />
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{activeTicket.priority}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{activeTicket.subject}</h3>
                      <p className="text-[11px] text-slate-400">From: {activeTicket.user.name} ({activeTicket.user.email}) • {activeTicket.category}</p>
                    </div>
                    <button onClick={() => setActiveTicket(null)} className="lg:hidden p-2 text-slate-400"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                      <button key={s} onClick={() => updateStatus(activeTicket.id, s)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${activeTicket.status === s ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeTicket.messages.map((m) => (
                    <div key={m.id} className={`max-w-[80%] p-3 rounded-xl text-xs ${m.sender.role === "CUSTOMER" ? "bg-slate-100 border border-slate-200" : "ml-auto bg-teal-600 text-white"}`}>
                      <div className={`flex justify-between font-bold mb-1 text-[10px] ${m.sender.role === "CUSTOMER" ? "text-slate-500" : "text-teal-100"}`}>
                        <span>{m.sender.name} ({m.sender.role})</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p>{m.message}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleReply} className="p-4 border-t border-slate-200 flex items-center space-x-2">
                  <input type="text" placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <button type="submit" disabled={sending || !replyText.trim()} className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition disabled:opacity-50"><Send className="w-4 h-4" /></button>
                </form>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
