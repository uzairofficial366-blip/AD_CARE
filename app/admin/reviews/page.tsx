"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, Flag, AlertCircle, Eye, EyeOff } from "lucide-react";

interface Review { id: string; rating: number; title: string | null; comment: string; isApproved: boolean; isReported: boolean; reportReason: string | null; isVerifiedPurchase: boolean; createdAt: string; product: { name: string; sku: string }; user: { name: string; email: string } }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchReviews = async () => { setLoading(true); try { const res = await fetch("/api/admin/reviews"); const data = await res.json(); setReviews(data.reviews || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchReviews(); }, []);

  const filtered = filter === "ALL" ? reviews : filter === "PENDING" ? reviews.filter((r) => !r.isApproved) : filter === "REPORTED" ? reviews.filter((r) => r.isReported) : reviews.filter((r) => r.isApproved);

  const toggleApproval = async (review: Review) => { try { await fetch(`/api/admin/reviews/${review.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isApproved: !review.isApproved }) }); fetchReviews(); } catch {} };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Reviews</h1><p className="text-xs text-slate-500 mt-1">Moderate customer reviews</p></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "APPROVED", "REPORTED"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${filter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}>{f}</button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Product</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Customer</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Rating</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Comment</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No reviews.</td></tr> : filtered.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><div className="font-bold text-slate-900">{r.product.name}</div><div className="text-[10px] text-slate-400 font-mono">SKU: {r.product.sku}</div></td>
                <td className="px-4 py-3"><div className="font-bold text-slate-800">{r.user.name}</div><div className="text-[10px] text-slate-400">{r.user.email}</div></td>
                <td className="px-4 py-3"><div className="flex items-center space-x-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</div></td>
                <td className="px-4 py-3 max-w-xs"><div className="font-bold text-slate-800 truncate">{r.title || "—"}</div><div className="text-slate-600 truncate mt-0.5">{r.comment}</div></td>
                <td className="px-4 py-3"><div className="flex items-center space-x-1">
                  {r.isVerifiedPurchase && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[8px] font-bold">VERIFIED</span>}
                  {r.isReported && <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[8px] font-bold flex items-center"><Flag className="w-2.5 h-2.5 mr-0.5" />REPORTED</span>}
                </div></td>
                <td className="px-4 py-3"><button onClick={() => toggleApproval(r)} className={`px-2 py-1 rounded text-[10px] font-bold transition ${r.isApproved ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>{r.isApproved ? "Disapprove" : "Approve"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
