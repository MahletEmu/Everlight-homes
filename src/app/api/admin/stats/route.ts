import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  Property,
  User,
  RentalAgreement,
  CommissionRecord,
  ReportDispute,
  VerificationRecord,
} from "@/lib/models";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireRole(["admin"]);
    await connectToDatabase();

    const [
      totalProperties,
      pendingProperties,
      approvedProperties,
      totalUsers,
      totalLandlords,
      totalTenants,
      totalAgreements,
      completedAgreements,
      pendingCommissions,
      paidCommissions,
      openDisputes,
      pendingVerifications,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ moderationStatus: "pending_review" }),
      Property.countDocuments({ moderationStatus: "approved" }),
      User.countDocuments(),
      User.countDocuments({ role: "landlord" }),
      User.countDocuments({ role: "tenant" }),
      RentalAgreement.countDocuments(),
      RentalAgreement.countDocuments({ status: "completed" }),
      CommissionRecord.countDocuments({ paymentStatus: "pending" }),
      CommissionRecord.find({ paymentStatus: "paid" }),
      ReportDispute.countDocuments({ status: "open" }),
      VerificationRecord.countDocuments({
        $or: [
          { ownerVerificationStatus: "pending" },
          { physicalInspectionStatus: "scheduled" },
        ],
      }),
    ]);

    const totalRevenueETB = paidCommissions.reduce((sum, c) => sum + (c.amountETB || 0), 0);

    return NextResponse.json({
      stats: {
        totalProperties,
        pendingProperties,
        approvedProperties,
        totalUsers,
        totalLandlords,
        totalTenants,
        totalAgreements,
        completedAgreements,
        pendingCommissions,
        paidCommissionsCount: paidCommissions.length,
        totalRevenueETB,
        openDisputes,
        pendingVerifications,
      },
    });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "FORBIDDEN" || (error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Administrator authorization required" }, { status: 403 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
