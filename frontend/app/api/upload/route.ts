import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    let diskWritable = true;
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {
      diskWritable = false;
    }

    for (const file of files) {
      if (!file || typeof file === "string") continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (diskWritable) {
        try {
          const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
          const cleanExt = extension || "jpg";
          const uniqueName = `watch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${cleanExt}`;
          const filePath = path.join(uploadsDir, uniqueName);
          fs.writeFileSync(filePath, buffer);
          uploadedUrls.push(`/uploads/${uniqueName}`);
          continue;
        } catch {
          // Fall through to Base64 if disk write fails
        }
      }

      // Fallback: Base64 data URL
      const mime = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      uploadedUrls.push(`data:${mime};base64,${base64}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to process uploaded file(s)." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed." },
      { status: 500 }
    );
  }
}

