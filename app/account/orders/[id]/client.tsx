"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShieldCheck, Pill, AlertCircle, XCircle, Download } from "lucide-react";
import { generateInvoiceHTML } from "@/lib/pdf/invoice";

interface OrderItem {
  id: string; productName: string; unitPrice: number; quantity: number;
  isPrescriptionRequired: boolean; totalPrice: number;
}

interface Order {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  paymentMethod: string; subtotal: number; discountAmount: number;
  shippingFee: number; totalAmount: number; shippingAddressJson: string;
  deliveryAgentName: string | null; estimatedDelivery: string | null;
  cancelReason: string | null; createdAt: string;
  items: OrderItem[];
  prescription: { fileName: string; status: string; pharmacistNotes: string | null } | null;
}

export default function OrderDetailClient({ order }: { order: Order }) {
  const shippingAddr = JSON.parse(order.shippingAddressJson || "{}");
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const canCancel = currentStatus !== "CANCELLED" && currentStatus !== "DELIVERED" && currentStatus !== "SHIPPED";

  const downloadInvoice = () => {
    const html = generateInvoiceHTML({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({ productName: i.productName, unitPrice: i.unitPrice, quantity: i.quantity, totalPrice: i.totalPrice, isPrescriptionRequired: i.isPrescriptionRequired })),
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: shippingAddr,
    });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.orderNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: cancelReason || "Cancelled by customer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrentStatus("CANCELLED");
      setShowCancelForm(false);
    } catch (err: any) { setError(err.message); } finally { setCancelling(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header user={null} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <Link href="/account/orders" className="text-xs text-slate-500 hover:text-teal-600 flex items-center">
          ← Back to Orders
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{order.orderNumber}</h1>
              <p className="text-xs text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentStatus === "DELIVERED" ? "bg-emerald-100 text-emerald-800" :
                currentStatus === "PRESCRIPTION_VERIFICATION" ? "bg-amber-100 text-amber-900 border border-amber-300" :
                currentStatus === "CANCELLED" ? "bg-red-100 text-red-800" :
                "bg-teal-100 text-teal-800"
              }`}>{currentStatus.replace(/_/g, " ")}</span>
              {canCancel && !showCancelForm && (
                <button onClick={() => setShowCancelForm(true)} className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition border border-red-200">
                  <XCircle className="w-3.5 h-3.5" /><span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>

          {showCancelForm && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-red-900">Cancel Order</h3>
              {error && <div className="bg-white border border-red-200 text-red-700 p-2 rounded-lg text-xs flex items-center space-x-2"><AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{error}</span></div>}
              <textarea rows={2} placeholder="Reason for cancellation (optional)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-xs" />
              <div className="flex space-x-2">
                <button onClick={handleCancel} disabled={cancelling} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50">{cancelling ? "Cancelling..." : "Confirm Cancel"}</button>
                <button onClick={() => setShowCancelForm(false)} className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition border border-slate-200">Keep Order</button>
              </div>
            </div>
          )}

          {order.prescription && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-xs text-teal-900 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Prescription: {order.prescription.fileName}</span>
                Status: <strong className="uppercase">{order.prescription.status}</strong>
                {order.prescription.pharmacistNotes && <p className="mt-1 italic text-slate-600">&quot;{order.prescription.pharmacistNotes}&quot;</p>}
              </div>
            </div>
          )}

          {currentStatus === "CANCELLED" && order.cancelReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-900 flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div><span className="font-bold">Cancel Reason:</span> {order.cancelReason}</div>
            </div>
          )}

          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Order Items</h2>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between bg-white">
                  <div>
                    <span className="font-bold text-slate-900 flex items-center">
                      {item.isPrescriptionRequired && <Pill className="w-3.5 h-3.5 mr-1 text-amber-600 shrink-0" />}
                      {item.productName}
                    </span>
                    <span className="text-slate-500 font-medium">${item.unitPrice.toFixed(2)} x {item.quantity}</span>
                  </div>
                  <span className="font-extrabold text-slate-900">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-4 border-t border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Delivery Address</h3>
              <p className="font-semibold text-slate-800">{shippingAddr.fullName}</p>
              <p className="text-slate-600">{shippingAddr.street}</p>
              <p className="text-slate-600">{shippingAddr.city}, {shippingAddr.state} {shippingAddr.zipCode}</p>
              <p className="text-slate-600">Phone: {shippingAddr.phone}</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Delivery & Payment</h3>
              <p className="text-slate-700">Carrier: <strong>{order.deliveryAgentName || "Express Pharmacy Courier"}</strong></p>
              <p className="text-slate-700">Est. Arrival: <strong>{order.estimatedDelivery || "3-5 Days"}</strong></p>
              <p className="text-slate-700 mt-1">Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between"><span>Subtotal:</span><span>${order.subtotal.toFixed(2)}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-emerald-700 font-medium"><span>Discount:</span><span>-${order.discountAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>Shipping:</span><span>${order.shippingFee.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2"><span>Total:</span><span className="text-teal-700">${order.totalAmount.toFixed(2)}</span></div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-3">
              <button onClick={downloadInvoice} className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition">
                <Download className="w-3.5 h-3.5" /><span>Download Invoice</span>
              </button>
              <Link href="/account/support" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition">Contact Support</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
