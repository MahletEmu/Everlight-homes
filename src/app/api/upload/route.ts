import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { uploadImageToStorage, isCloudinaryConfigured } from "@/lib/cloudinary";

const MAX_FILE_SIZE_BYTES = 6 * 1024 * 1024; // 6MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(req: Request) {
  try {
    await requireRole(["landlord", "admin"]);

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            "External image storage (Cloudinary) is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env.local file to enable persistent file uploads.",
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file format. Allowed: JPG, PNG, WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file exceeds maximum allowed size of 6MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploaded = await uploadImageToStorage(base64String, "everlight_properties");

    return NextResponse.json({
      message: "Image uploaded successfully",
      url: uploaded.url,
      publicId: uploaded.publicId,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "FORBIDDEN" || (error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Landlord authorization required" }, { status: 403 });
    }
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
