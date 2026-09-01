import { NextResponse } from "next/server";
import { getSession } from "./session";
import { hasMinimumRole, hasPermission, type Permission } from "./rbac";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  if (!hasMinimumRole(session.role, "ADMIN")) {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { session };
}

export async function requireSuperAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  if (!hasMinimumRole(session.role, "SUPERADMIN")) {
    return { error: NextResponse.json({ error: "SuperAdmin access required." }, { status: 403 }) };
  }
  return { session };
}

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

export async function requirePharmacist() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  if (!hasMinimumRole(session.role, "PHARMACIST")) {
    return { error: NextResponse.json({ error: "Pharmacist access required." }, { status: 403 }) };
  }
  return { session };
}
