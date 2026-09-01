"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, FileText, RotateCw, CheckCircle2 } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    imageUrl: string | null;
    isPrescriptionRequired: boolean;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    const cart = JSON.parse(localStorage.getItem("medicare_cart") || "[]");
    const existing = cart.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price,
        imageUrl: product.imageUrl,
        quantity: 1,
        isPrescriptionRequired: product.isPrescriptionRequired,
      });
    }
    localStorage.setItem("medicare_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex items-center space-x-4 pt-2">
      <button
        onClick={handleAddToCart}
        className={`flex-1 py-3 rounded-xl font-bold text-sm text-center shadow-md transition flex items-center justify-center space-x-2 ${
          added ? "bg-emerald-600 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
        }`}
      >
        {added ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Added to Cart!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
      {product.isPrescriptionRequired && (
        <Link
          href="/prescriptions/upload"
          className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow-sm"
        >
          <FileText className="w-4 h-4" />
          <span>Upload Rx</span>
        </Link>
      )}
      <Link
        href="/account/refill-reminders"
        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
        title="Set Refill Reminder"
      >
        <RotateCw className="w-4 h-4" />
      </Link>
    </div>
  );
}
