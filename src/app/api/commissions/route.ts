import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CommissionRecord } from "@/lib/models";
import { requireUser } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (user.role !== "admin") {
      filter.payerId = user.userId;
    } else if (status) {
      filter.paymentStatus = status;
    }

    const commissions = await CommissionRecord.find(filter)
      .populate("propertyId", "title city neighborhood monthlyRent")
      .populate("agreementId", "agreedRent startDate durationMonths status")
      .populate("payerId", "name email phone")
      .populate("reconciledByAdminId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ commissions });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get commissions error:", error);
    return NextResponse.json({ error: "Failed to fetch commission records" }, { status: 500 });
  }
}
