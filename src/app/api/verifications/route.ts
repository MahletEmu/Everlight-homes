import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { VerificationRecord, Property, AuditLog } from "@/lib/models";
import { requireUser, requireRole } from "@/lib/auth/session";
import { VerificationUpdateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filter: Record<string, any> = {};
    if (user.role === "landlord") {
      filter = { landlordId: user.userId };
    } else if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const records = await VerificationRecord.find(filter)
      .populate("propertyId", "title city neighborhood monthlyRent verificationStatus images")
      .populate("landlordId", "name email phone isVerified")
      .populate("reviewingAdminId", "name")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ records });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get verifications error:", error);
    return NextResponse.json({ error: "Failed to fetch verification records" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireRole(["admin"]);
    const body = await req.json();
    const { recordId, ...updateData } = body;

    if (!recordId) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
    }

    const parsed = VerificationUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const record = await VerificationRecord.findById(recordId);
    if (!record) {
      return NextResponse.json({ error: "Verification record not found" }, { status: 404 });
    }

    const {
      ownerVerificationStatus,
      physicalInspectionStatus,
      inspectionDate,
      inspectorName,
      notes,
    } = parsed.data;

    record.ownerVerificationStatus = ownerVerificationStatus;
    record.physicalInspectionStatus = physicalInspectionStatus;
    if (inspectionDate) record.inspectionDate = new Date(inspectionDate);
    if (inspectorName) record.inspectorName = inspectorName;
    if (notes) record.notes = notes;
    record.reviewingAdminId = admin.userId as unknown as typeof record.reviewingAdminId;

    await record.save();

    // Determine honest property verification tier
    let tier: "unverified" | "owner_verified" | "physically_inspected" | "fully_verified" =
      "unverified";

    if (ownerVerificationStatus === "verified" && physicalInspectionStatus === "inspected") {
      tier = "fully_verified";
    } else if (ownerVerificationStatus === "verified") {
      tier = "owner_verified";
    } else if (physicalInspectionStatus === "inspected") {
      tier = "physically_inspected";
    }

    await Property.findByIdAndUpdate(record.propertyId, {
      verificationStatus: tier,
    });

    // Record audit log
    await AuditLog.create({
      adminId: admin.userId,
      action: "UPDATE_VERIFICATION",
      resourceType: "verification",
      resourceId: recordId,
      details: {
        ownerVerificationStatus,
        physicalInspectionStatus,
        tier,
        inspectorName,
      },
    });

    return NextResponse.json({
      message: "Verification record and property status updated successfully.",
      record,
      tier,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "FORBIDDEN" || (error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Administrator authorization required" }, { status: 403 });
    }
    console.error("Update verification error:", error);
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 });
  }
}
