import { getSession } from "./session";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// ─── PERMISSION DEFINITIONS ─────────────────────────────────

export const PERMISSIONS = {
  // Products
  "products.view": ["SUPERADMIN", "ADMIN", "PHARMACIST"],
  "products.create": ["SUPERADMIN", "ADMIN"],
  "products.update": ["SUPERADMIN", "ADMIN"],
  "products.delete": ["SUPERADMIN", "ADMIN"],

  // Categories
  "categories.view": ["SUPERADMIN", "ADMIN", "PHARMACIST"],
  "categories.manage": ["SUPERADMIN", "ADMIN"],

  // Brands
  "brands.view": ["SUPERADMIN", "ADMIN", "PHARMACIST"],
  "brands.manage": ["SUPERADMIN", "ADMIN"],

  // Inventory
  "inventory.view": ["SUPERADMIN", "ADMIN", "PHARMACIST"],
  "inventory.update": ["SUPERADMIN", "ADMIN"],
  "inventory.adjust": ["SUPERADMIN", "ADMIN"],
  "batches.manage": ["SUPERADMIN", "ADMIN"],

  // Prescriptions
  "prescriptions.view": ["SUPERADMIN", "ADMIN", "PHARMACIST"],
  "prescriptions.review": ["SUPERADMIN", "PHARMACIST"],
  "prescriptions.approve": ["SUPERADMIN", "PHARMACIST"],
  "prescriptions.reject": ["SUPERADMIN", "PHARMACIST"],

  // Orders
  "orders.view": ["SUPERADMIN", "ADMIN"],
  "orders.update": ["SUPERADMIN", "ADMIN"],
  "orders.cancel": ["SUPERADMIN", "ADMIN"],
  "orders.refund": ["SUPERADMIN", "ADMIN"],

  // Customers
  "customers.view": ["SUPERADMIN", "ADMIN"],
  "customers.suspend": ["SUPERADMIN", "ADMIN"],

  // Payments
  "payments.view": ["SUPERADMIN", "ADMIN"],
  "payments.refund": ["SUPERADMIN", "ADMIN"],

  // Reports
  "reports.view": ["SUPERADMIN", "ADMIN"],

  // Settings
  "settings.update": ["SUPERADMIN", "ADMIN"],

  // Users & Permissions
  "admins.manage": ["SUPERADMIN"],

  // Delivery
  "delivery.view": ["SUPERADMIN", "ADMIN"],
  "delivery.manage": ["SUPERADMIN", "ADMIN"],

  // Suppliers
  "suppliers.view": ["SUPERADMIN", "ADMIN"],
  "suppliers.manage": ["SUPERADMIN", "ADMIN"],

  // Support
  "support.view": ["SUPERADMIN", "ADMIN"],
  "support.manage": ["SUPERADMIN", "ADMIN"],

  // Coupons
  "coupons.view": ["SUPERADMIN", "ADMIN"],
  "coupons.manage": ["SUPERADMIN", "ADMIN"],

  // Notifications
  "notifications.view": ["SUPERADMIN", "ADMIN", "PHARMACIST", "CUSTOMER"],
  "notifications.manage": ["SUPERADMIN", "ADMIN"],

  // Loyalty
  "loyalty.view": ["SUPERADMIN", "ADMIN"],
  "loyalty.manage": ["SUPERADMIN", "ADMIN"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ─── ROLE HIERARCHY ─────────────────────────────────────────

const ROLE_HIERARCHY: Record<string, number> = {
  CUSTOMER: 0,
  PHARMACIST: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

// ─── CHECK FUNCTIONS ────────────────────────────────────────

export function hasPermission(role: string, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return (allowedRoles as readonly string[]).includes(role);
}

export function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

// ─── SERVER-SIDE HELPERS ────────────────────────────────────

export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  if (!hasPermission(session.role, permission)) {
    return { error: NextResponse.json({ error: `Permission denied: ${permission}` }, { status: 403 }) };
  }
  return { session };
}

export async function requireRole(role: string) {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  if (!hasMinimumRole(session.role, role)) {
    return { error: NextResponse.json({ error: `${role} role or higher required.` }, { status: 403 }) };
  }
  return { session };
}

// ─── AUDIT LOG HELPER ───────────────────────────────────────

export async function logAudit(params: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
        newValues: params.newValues ? JSON.stringify(params.newValues) : null,
        metadata: params.metadata || null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch {
    // Non-blocking — audit log failures should not break operations
  }
}

// ─── NOTIFICATION HELPER ────────────────────────────────────

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link || null,
      },
    });
  } catch {
    // Non-blocking
  }
}
