import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { storage, generateStorageKey } from "@/lib/storage";
import { detectSafeExtension } from "@/lib/storage/file-signature";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const userId = session?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Login required to upload prescriptions." }, { status: 401 });
    }

    const formData = await request.formData();
    const patientName = formData.get("patientName") as string;
    const patientAgeStr = formData.get("patientAge") as string;
    const notes = formData.get("notes") as string;
    const file = formData.get("file") as File;

    if (!patientName || !file) {
      return NextResponse.json(
        { error: "Patient name and prescription file are required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and PDF files are allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeExt = detectSafeExtension(buffer, ALLOWED_MIME_TYPES);
    if (!safeExt) {
      return NextResponse.json(
        { error: "File content does not match the declared type." },
        { status: 400 }
      );
    }

    const patientAge = patientAgeStr ? parseInt(patientAgeStr, 10) : null;
    const prescriptionId = crypto.randomUUID();
    const storageKey = generateStorageKey(prescriptionId, safeExt);

    await storage.put(storageKey, buffer);

    const fileUrl = `/api/storage/${storageKey}`;
    const fileName = file.name;
    const fileMimeType = file.type;

    const prescription = await prisma.prescription.create({
      data: {
        userId,
        patientName,
        patientAge,
        fileUrl,
        fileName,
        fileMimeType,
        status: "PENDING_REVIEW",
        pharmacistNotes: notes || null,
      },
    });

    await prisma.prescriptionAuditLog.create({
      data: {
        prescriptionId: prescription.id,
        actorId: userId,
        oldStatus: null,
        newStatus: "PENDING_REVIEW",
        notes: "Prescription document uploaded by customer.",
      },
    });

    return NextResponse.json({
      success: true,
      prescriptionId: prescription.id,
      status: prescription.status,
      message: "Prescription submitted for pharmacist verification.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
