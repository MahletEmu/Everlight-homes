import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, AuditLog } from "@/lib/models";
import { requireRole } from "@/lib/auth/session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(["admin"]);
    const { id } = await params;
    const body = await req.json();

    const { moderationStatus, rejectionReason, verificationStatus, featured } = body;

    await connectToDatabase();

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (moderationStatus && ["approved", "rejected", "pending_review"].includes(moderationStatus)) {
      updates.moderationStatus = moderationStatus;
      if (moderationStatus === "rejected") {
        updates.rejectionReason = rejectionReason || "Does not meet Everlight quality standards.";
      } else {
        updates.rejectionReason = "";
      }
    }

    if (
      verificationStatus &&
      ["unverified", "owner_verified", "physically_inspected", "fully_verified"].includes(
        verificationStatus
      )
    ) {
      updates.verificationStatus = verificationStatus;
    }

    if (typeof featured === "boolean") {
      updates.featured = featured;
    }

    const updated = await Property.findByIdAndUpdate(id, updates, { new: true });

    // Auditable admin action record
    await AuditLog.create({
      adminId: admin.userId,
      action: "MODERATE_PROPERTY",
      resourceType: "property",
      resourceId: id,
      details: updates,
    });

    return NextResponse.json({
      message: "Property moderation updated successfully",
      property: updated,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "FORBIDDEN" || (error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Moderate property error:", error);
    return NextResponse.json({ error: "Failed to moderate property" }, { status: 500 });
  }
}
