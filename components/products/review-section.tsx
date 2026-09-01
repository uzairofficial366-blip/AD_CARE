"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewForm } from "@/components/products/review-form";
import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface ReviewSectionProps {
  productId: string;
  ratingAverage: number;
  ratingCount: number;
  reviews: Review[];
  isLoggedIn: boolean;
}

export function ReviewSection({ productId, ratingAverage, ratingCount, reviews, isLoggedIn }: ReviewSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Customer Reviews</h2>
          <p className="text-xs text-slate-500">Feedback from verified pharmacy customers</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-2xl font-extrabold text-slate-900">{ratingAverage.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-medium"> / 5.0</span>
          </div>
          {isLoggedIn && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <ReviewForm
            productId={productId}
            onSuccess={() => {
              setShowForm(false);
              router.refresh();
            }}
          />
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            {isLoggedIn ? "No reviews yet. Be the first to share your experience!" : "No customer reviews yet."}
          </p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{rev.user.name}</span>
                <div className="flex items-center">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-slate-600">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
