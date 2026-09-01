import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SignJWT } from "jose";
import { sendEmail } from "@/lib/email";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback-secret");

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    const token = await new SignJWT({ userId: user.id, purpose: "password-reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(SECRET);

    const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your AD CARE Pharmacy Password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <div style="background:#0d9488;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center">
            <h1 style="margin:0;font-size:22px">AD CARE Pharmacy</h1>
          </div>
          <div style="background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:0 0 10px 10px">
            <p style="color:#475569;font-size:14px">Hi ${user.name},</p>
            <p style="color:#475569;font-size:14px">We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align:center;margin:24px 0">
              <a href="${resetUrl}" style="background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">Reset Password</a>
            </div>
            <p style="color:#94a3b8;font-size:12px">This link expires in 1 hour. If you didn&apos;t request this, ignore this email.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
