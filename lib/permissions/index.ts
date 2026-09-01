import type { SessionPayload } from "@/lib/auth/session";
import { hasPermission, hasMinimumRole, type Permission } from "@/lib/auth/rbac";

export class UnauthorizedError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function requireSession(session: SessionPayload | null): SessionPayload {
  if (!session) throw new UnauthorizedError("Please log in to continue.");
  return session;
}

export function requireAdmin(session: SessionPayload | null): SessionPayload {
  const s = requireSession(session);
  if (!hasMinimumRole(s.role, "ADMIN")) throw new UnauthorizedError();
  return s;
}

export function requireSuperAdmin(session: SessionPayload | null): SessionPayload {
  const s = requireSession(session);
  if (!hasMinimumRole(s.role, "SUPERADMIN")) throw new UnauthorizedError("SuperAdmin access required.");
  return s;
}

export function requirePermission(session: SessionPayload | null, permission: Permission): SessionPayload {
  const s = requireSession(session);
  if (!hasPermission(s.role, permission)) throw new UnauthorizedError(`Permission denied: ${permission}`);
  return s;
}

export function canAccessOrder(
  session: SessionPayload,
  order: { userId: string }
): boolean {
  if (hasMinimumRole(session.role, "ADMIN")) return true;
  return order.userId === session.userId;
}

export function canAccessPrescription(
  session: SessionPayload,
  prescription: { userId: string }
): boolean {
  if (hasMinimumRole(session.role, "PHARMACIST")) return true;
  return prescription.userId === session.userId;
}
