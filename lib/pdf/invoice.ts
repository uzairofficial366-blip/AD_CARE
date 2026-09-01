interface InvoiceItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isPrescriptionRequired: boolean;
}

interface InvoiceData {
  orderNumber: string;
  createdAt: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const itemRows = data.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#475569">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-weight:600">
          ${item.productName}
          ${item.isPrescriptionRequired ? '<span style="color:#d97706;font-size:10px;margin-left:4px">[Rx]</span>' : ""}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#475569">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#475569">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#0f172a;font-weight:600">$${item.totalPrice.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Invoice ${data.orderNumber}</title></head>
    <body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;background:#f8fafc">
      <div style="max-width:700px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
        <!-- Header -->
        <div style="background:#0d9488;padding:24px 32px;color:white">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <h1 style="margin:0;font-size:28px;letter-spacing:-0.5px">AD CARE Pharmacy</h1>
              <p style="margin:4px 0 0;opacity:0.85;font-size:13px">Meds & Pharmacy — Invoice</p>
            </div>
            <div style="text-align:right">
              <p style="margin:0;font-size:20px;font-weight:bold">INVOICE</p>
              <p style="margin:4px 0 0;opacity:0.85;font-size:13px">${data.orderNumber}</p>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div style="padding:32px">
          <!-- Info Grid -->
          <div style="display:flex;justify-content:space-between;margin-bottom:28px">
            <div>
              <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:bold;letter-spacing:0.5px">Bill To</p>
              <p style="margin:0;font-size:14px;color:#0f172a;font-weight:600">${data.shippingAddress.fullName}</p>
              <p style="margin:2px 0 0;font-size:13px;color:#475569">${data.shippingAddress.street}</p>
              <p style="margin:2px 0 0;font-size:13px;color:#475569">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
              <p style="margin:2px 0 0;font-size:13px;color:#475569">Phone: ${data.shippingAddress.phone}</p>
            </div>
            <div style="text-align:right">
              <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:bold;letter-spacing:0.5px">Invoice Date</p>
              <p style="margin:0;font-size:13px;color:#0f172a">${new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:bold;letter-spacing:0.5px">Payment</p>
              <p style="margin:0;font-size:13px;color:#0f172a">${data.paymentMethod} — ${data.paymentStatus}</p>
            </div>
          </div>

          <!-- Items Table -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead>
              <tr style="background:#f1f5f9">
                <th style="padding:10px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0">#</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0">Item</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0">Price</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- Totals -->
          <div style="display:flex;justify-content:flex-end">
            <div style="width:260px">
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569">
                <span>Subtotal</span><span>$${data.subtotal.toFixed(2)}</span>
              </div>
              ${data.discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#059669"><span>Discount</span><span>-$${data.discountAmount.toFixed(2)}</span></div>` : ""}
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569">
                <span>Shipping</span><span>${data.shippingFee === 0 ? "FREE" : "$" + data.shippingFee.toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:bold;color:#0f172a;border-top:2px solid #0d9488;margin-top:6px">
                <span>Total</span><span style="color:#0d9488">$${data.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f1f5f9;padding:16px 32px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0">
          <p style="margin:0">AD CARE Pharmacy — Licensed Online Pharmacy Platform</p>
          <p style="margin:4px 0 0">Questions? Contact support@adc-care.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateInvoicePDFScript(data: InvoiceData): string {
  const html = generateInvoiceHTML(data);
  return `
    const win = window.open('', '_blank');
    win.document.write(\`${html.replace(/`/g, "\\`")}\`);
    win.document.close();
    win.print();
  `;
}
