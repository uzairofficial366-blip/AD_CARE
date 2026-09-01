// ─── ORDER STATUS STATE MACHINE ─────────────────────────────
// Defines valid status transitions for the pharmacy order lifecycle.
// Prevents invalid transitions like shipping a cancelled order.

export const ORDER_STATUSES = [
  "PENDING",
  "PAYMENT_CONFIRMED",
  "PRESCRIPTION_REQUIRED",
  "PRESCRIPTION_VERIFICATION",
  "PRESCRIPTION_APPROVED",
  "PRESCRIPTION_REJECTED",
  "PROCESSING",
  "PACKED",
  "ASSIGNED_TO_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUND_PENDING",
  "REFUNDED",
  "PAYMENT_FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Valid transitions: from -> [allowed destinations]
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAYMENT_CONFIRMED", "CANCELLED", "PAYMENT_FAILED"],
  PAYMENT_CONFIRMED: ["PRESCRIPTION_REQUIRED", "PROCESSING", "CANCELLED"],
  PRESCRIPTION_REQUIRED: ["PRESCRIPTION_VERIFICATION", "CANCELLED"],
  PRESCRIPTION_VERIFICATION: ["PRESCRIPTION_APPROVED", "PRESCRIPTION_REJECTED", "CANCELLED"],
  PRESCRIPTION_APPROVED: ["PROCESSING", "CANCELLED"],
  PRESCRIPTION_REJECTED: ["CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["ASSIGNED_TO_DELIVERY", "CANCELLED"],
  ASSIGNED_TO_DELIVERY: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "RETURN_REQUESTED"],
  DELIVERED: ["RETURN_REQUESTED", "REFUND_PENDING"],
  CANCELLED: [],
  RETURN_REQUESTED: ["RETURNED", "CANCELLED"],
  RETURNED: ["REFUND_PENDING", "REFUNDED"],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: [],
  PAYMENT_FAILED: ["PENDING", "CANCELLED"],
};

// ─── VALIDATION ─────────────────────────────────────────────

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateStatusTransition(from: OrderStatus, to: OrderStatus): { valid: boolean; error?: string } {
  if (!isValidTransition(from, to)) {
    return {
      valid: false,
      error: `Cannot transition from "${from}" to "${to}". Valid transitions: ${VALID_TRANSITIONS[from]?.join(", ") || "none"}`,
    };
  }
  return { valid: true };
}

// ─── PAYMENT STATUS ─────────────────────────────────────────

export const PAYMENT_STATUSES = ["PENDING", "AUTHORIZED", "PAID", "FAILED", "CANCELLED", "PARTIALLY_REFUNDED", "REFUNDED"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ─── DELIVERY STATUS ────────────────────────────────────────

export const DELIVERY_STATUSES = [
  "AWAITING_ASSIGNMENT",
  "ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  AWAITING_ASSIGNMENT: ["ASSIGNED", "CANCELLED" as any],
  ASSIGNED: ["PICKED_UP", "AWAITING_ASSIGNMENT"],
  PICKED_UP: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: ["AWAITING_ASSIGNMENT"],
  RETURNED: [],
};

export function isValidDeliveryTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return DELIVERY_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── PRESCRIPTION STATUS ────────────────────────────────────

export const PRESCRIPTION_STATUSES = [
  "PENDING_REVIEW",
  "UNDER_PHARMACIST_REVIEW",
  "APPROVED",
  "REJECTED",
  "CLARIFICATION_REQUESTED",
  "EXPIRED",
] as const;

export type PrescriptionStatus = (typeof PRESCRIPTION_STATUSES)[number];

// ─── SUPPORT TICKET STATUS ──────────────────────────────────

export const TICKET_STATUSES = ["OPEN", "ASSIGNED", "PENDING_CUSTOMER", "PENDING_INTERNAL", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

// ─── HUMAN-READABLE LABELS ──────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending Payment",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  PRESCRIPTION_REQUIRED: "Prescription Required",
  PRESCRIPTION_VERIFICATION: "Prescription Review",
  PRESCRIPTION_APPROVED: "Prescription Approved",
  PRESCRIPTION_REJECTED: "Prescription Rejected",
  PROCESSING: "Processing",
  PACKED: "Packed",
  ASSIGNED_TO_DELIVERY: "Assigned to Delivery",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return Requested",
  RETURNED: "Returned",
  REFUND_PENDING: "Refund Pending",
  REFUNDED: "Refunded",
  PAYMENT_FAILED: "Payment Failed",
  PENDING_REVIEW: "Pending Review",
  UNDER_PHARMACIST_REVIEW: "Under Pharmacist Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CLARIFICATION_REQUESTED: "Clarification Requested",
  EXPIRED: "Expired",
  AWAITING_ASSIGNMENT: "Awaiting Assignment",
  ASSIGNED: "Assigned",
  PICKED_UP: "Picked Up",
  FAILED: "Failed",
  OPEN: "Open",
  PENDING_CUSTOMER: "Pending Customer",
  PENDING_INTERNAL: "Pending Internal",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status.replace(/_/g, " ");
}
