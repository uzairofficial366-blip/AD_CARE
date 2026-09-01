import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, isPasswordStrong } from "@/lib/auth/password";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback-secret");

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (!isPasswordStrong(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 10 characters with at least one letter and one number." },
        { status: 400 }
      );
    }

    let payload;
    try {
      const verified = await jwtVerify(token, SECRET);
      payload = verified.payload;
    } catch {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    if (payload.purpose !== "password-reset" || typeof payload.userId !== "string") {
      return NextResponse.json({ error: "Invalid token." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
