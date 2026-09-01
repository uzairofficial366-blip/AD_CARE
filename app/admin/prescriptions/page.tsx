"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Package, ExternalLink, RefreshCw, AlertCircle, X } from "lucide-react";

interface Prescription {
  id: string;
  patientName: string;
  patientAge: number | null;
  fileName: string;
  fileMimeType: string;
  fileUrl: string;
  status: string;
  pharmacistNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  reviewedBy: { id: string; name: string } | null;
}

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [reviewing, setReviewing] = useState<Prescription | null>(null);

  const fetchPrescriptions = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/prescriptions");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setPrescriptions(data.prescriptions || []);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const filtered = filter === "ALL" ? prescriptions : prescriptions.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Prescription Reviews</h1>
          <p className="text-xs text-slate-500 mt-1">Review, approve, or reject customer prescriptions</p>
        </div>
        <button onClick={fetchPrescriptions} disabled={loading} className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /><span>Refresh</span>
        </button>
      </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "PENDING_REVIEW", "UNDER_PHARMACIST_REVIEW", "APPROVED", "REJECTED", "CLARIFICATION_REQUESTED"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${filter === s ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}>
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-bold text-slate-600">Patient</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">Customer</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">File</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">Reviewed By</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No prescriptions found.</td></tr>
                ) : filtered.map((rx) => (
                  <tr key={rx.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{rx.patientName}</div>
                      {rx.patientAge && <div className="text-slate-400">Age: {rx.patientAge}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{rx.user.name}</div>
                      <div className="text-slate-400">{rx.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1 text-slate-600">
                        <Package className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{rx.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={rx.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{rx.reviewedBy?.name || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(rx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setReviewing(rx)} className="inline-flex items-center space-x-1 text-teal-700 hover:underline font-bold">
                        <span>Review</span><ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {reviewing && <ReviewModal prescription={reviewing} onClose={() => setReviewing(null)} onUpdated={fetchPrescriptions} />}
    </div>
  );
}

function ReviewModal({ prescription, onClose, onUpdated }: { prescription: Prescription; onClose: () => void; onUpdated: () => void }) {
  const [status, setStatus] = useState(prescription.status === "PENDING_REVIEW" ? "UNDER_PHARMACIST_REVIEW" : prescription.status);
  const [notes, setNotes] = useState(prescription.pharmacistNotes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/admin/prescriptions/${prescription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, pharmacistNotes: notes || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated();
      onClose();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Review Prescription</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
          <div><span className="font-bold text-slate-700">Patient:</span> {prescription.patientName} {prescription.patientAge ? `(${prescription.patientAge} yrs)` : ""}</div>
          <div><span className="font-bold text-slate-700">Customer:</span> {prescription.user.name} ({prescription.user.email})</div>
          <div><span className="font-bold text-slate-700">File:</span> {prescription.fileName}</div>
          <div><a href={prescription.fileUrl} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline font-bold">View Uploaded File →</a></div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">{error}</div>}

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg">
              <option value="UNDER_PHARMACIST_REVIEW">Under Pharmacist Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLARIFICATION_REQUESTED">Clarification Requested</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pharmacist Notes</label>
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Add review notes, conditions, or rejection reason..." />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
