import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

const MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

export async function GET(_request: Request, { params }: { params: { key: string[] } }) {
  try {
    const key = params.key.join("/");
    if (!key || key.includes("..")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const data = await storage.get(key);
    const ext = key.substring(key.lastIndexOf(".")).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
