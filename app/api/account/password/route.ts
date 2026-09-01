import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, hashPassword, isPasswordStrong } from "@/lib/auth/password";

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required." }, { status: 400 });
    }

    if (!isPasswordStrong(newPassword)) {
      return NextResponse.json(
        { error: "New password must be at least 10 characters with at least one letter and one number." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
