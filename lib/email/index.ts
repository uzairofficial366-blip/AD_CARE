interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const LOG_PREFIX = "[EMAIL]";

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  console.log(`${LOG_PREFIX} Sending email to: ${payload.to}`);
  console.log(`${LOG_PREFIX} Subject: ${payload.subject}`);
  console.log(`${LOG_PREFIX} Body preview: ${payload.html.substring(0, 200)}...`);

  // In production, integrate with your email provider:
  // - SendGrid: https://docs.sendgrid.com/api/mail/mail-send
  // - AWS SES, Resend, Mailgun, etc.

  return true;
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  totalAmount: number;
  items: { productName: string; quantity: number; totalPrice: number }[];
  status: string;
  shippingAddress: any;
}): EmailPayload & { subject: string } {
  const itemRows = order.items
    .map((i) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.productName}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${i.totalPrice.toFixed(2)}</td></tr>`)
    .join("");

  return {
    to: order.shippingAddress?.email || "customer@example.com",
    subject: `Order Confirmation — ${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#0d9488;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center">
          <h1 style="margin:0;font-size:24px">AD CARE Pharmacy</h1>
          <p style="margin:5px 0 0;opacity:0.9">Order Confirmation</p>
        </div>
        <div style="background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:0 0 10px 10px">
          <h2 style="color:#0f172a;margin-top:0">Thank you for your order!</h2>
          <p style="color:#475569;font-size:14px">Order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead><tr style="background:#f1f5f9"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Total</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="text-align:right;font-size:18px;font-weight:bold;color:#0d9488;margin-top:16px">
            Total: $${order.totalAmount.toFixed(2)}
          </div>
          <p style="color:#64748b;font-size:12px;margin-top:20px">
            Status: <strong>${order.status.replace(/_/g, " ")}</strong><br>
            You can track your order from your account dashboard.
          </p>
        </div>
      </div>
    `,
  };
}

export function prescriptionStatusEmail(data: {
  patientName: string;
  status: string;
  pharmacistNotes?: string | null;
}): EmailPayload & { subject: string } {
  const statusMessage: Record<string, string> = {
    APPROVED: "Your prescription has been approved by our pharmacist.",
    REJECTED: "Your prescription could not be verified. Please upload a new one.",
    CLARIFICATION_REQUESTED: "Our pharmacist needs additional information about your prescription.",
    UNDER_PHARMACIST_REVIEW: "Your prescription is currently being reviewed by our licensed pharmacist.",
  };

  return {
    to: "customer@example.com",
    subject: `Prescription Update — ${data.status.replace(/_/g, " ")}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#0d9488;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center">
          <h1 style="margin:0;font-size:24px">AD CARE Pharmacy</h1>
          <p style="margin:5px 0 0;opacity:0.9">Prescription Status Update</p>
        </div>
        <div style="background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:0 0 10px 10px">
          <h2 style="color:#0f172a;margin-top:0">Prescription Review Update</h2>
          <p style="color:#475569;font-size:14px">Hi ${data.patientName},</p>
          <p style="color:#475569;font-size:14px">${statusMessage[data.status] || "Your prescription status has been updated."}</p>
          ${data.pharmacistNotes ? `<div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:12px;margin:16px 0"><p style="color:#92400e;font-size:13px;margin:0"><strong>Pharmacist Notes:</strong> ${data.pharmacistNotes}</p></div>` : ""}
          <p style="color:#64748b;font-size:12px;margin-top:20px">Log in to your account to view full details.</p>
        </div>
      </div>
    `,
  };
}

export function orderShippedEmail(data: {
  orderNumber: string;
  deliveryAgentName: string;
  estimatedDelivery: string;
}): EmailPayload & { subject: string } {
  return {
    to: "customer@example.com",
    subject: `Your Order ${data.orderNumber} Has Been Shipped!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#0d9488;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center">
          <h1 style="margin:0;font-size:24px">AD CARE Pharmacy</h1>
          <p style="margin:5px 0 0;opacity:0.9">Shipping Notification</p>
        </div>
        <div style="background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:0 0 10px 10px">
          <h2 style="color:#0f172a;margin-top:0">Your order is on the way!</h2>
          <p style="color:#475569;font-size:14px">Order <strong>${data.orderNumber}</strong> has been shipped.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0 0 8px;color:#166534;font-size:14px"><strong>Carrier:</strong> ${data.deliveryAgentName}</p>
            <p style="margin:0;color:#166534;font-size:14px"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
          </div>
          <p style="color:#64748b;font-size:12px;margin-top:20px">Track your order from your account dashboard.</p>
        </div>
      </div>
    `,
  };
}
