"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    imageUrl: string | null;
    stockQuantity: number;
    isPrescriptionRequired: boolean;
    category: { name: string } | null;
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("medicare_wishlist");
    const ids: string[] = stored ? JSON.parse(stored) : [];
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(
      ids.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      const valid = results.filter(Boolean).map((data, i) => ({
        id: ids[i],
        productId: ids[i],
        createdAt: new Date().toISOString(),
        product: data.product || data,
      }));
      setItems(valid);
      setLoading(false);
    });
  }, []);

  const removeItem = (productId: string) => {
    const stored = localStorage.getItem("medicare_wishlist");
    const ids: string[] = stored ? JSON.parse(stored) : [];
    const updated = ids.filter((id) => id !== productId);
    localStorage.setItem("medicare_wishlist", JSON.stringify(updated));
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const addToCart = (productId: string) => {
    const stored = localStorage.getItem("medicare_cart");
    const cart: Record<string, number> = stored ? JSON.parse(stored) : {};
    cart[productId] = (cart[productId] || 0) + 1;
    localStorage.setItem("medicare_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header user={null} />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="w-6 h-6 text-pink-600" />
          <h1 className="text-2xl font-extrabold text-slate-900">My Wishlist</h1>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-sm text-slate-500 mb-4">Your wishlist is empty.</p>
            <Link
              href="/products"
              className="inline-block px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const p = item.product;
              const displayPrice = p.salePrice ?? p.price;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col"
                >
                  <Link href={`/products/${p.id}`} className="flex items-start space-x-3 mb-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-2">{p.name}</h3>
                      {p.category && <p className="text-[11px] text-slate-400 mt-0.5">{p.category.name}</p>}
                      <p className="text-sm font-bold text-teal-700 mt-1">${displayPrice.toFixed(2)}</p>
                    </div>
                  </Link>

                  <div className="mt-auto flex items-center space-x-2">
                    <button
                      onClick={() => addToCart(p.id)}
                      disabled={p.stockQuantity === 0}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{p.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}</span>
                    </button>
                    <button
                      onClick={() => removeItem(p.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
