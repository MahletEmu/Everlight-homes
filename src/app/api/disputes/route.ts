import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ReportDispute, AuditLog } from "@/lib/models";
import { requireUser } from "@/lib/auth/session";
import { DisputeSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filter: Record<string, any> = {};
    if (user.role !== "admin") {
      filter = { reportingUserId: user.userId };
    }

    const disputes = await ReportDispute.find(filter)
      .populate("reportingUserId", "name email role")
      .populate("assignedAdminId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ disputes });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get disputes error:", error);
    return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const parsed = DisputeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const dispute = await ReportDispute.create({
      ...parsed.data,
      reportingUserId: user.userId,
      status: "open",
    });

    return NextResponse.json(
      {
        message: "Your report has been submitted to Everlight moderators for review.",
        dispute,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please sign in to submit a report" }, { status: 401 });
    }
    console.error("Create dispute error:", error);
    return NextResponse.json({ error: "Failed to submit dispute" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Administrator authorization required" }, { status: 403 });
    }

    const body = await req.json();
    const { disputeId, status, resolutionNotes } = body;

    if (!disputeId) {
      return NextResponse.json({ error: "Dispute ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const dispute = await ReportDispute.findById(disputeId);
    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    if (status && ["open", "under_review", "resolved", "dismissed"].includes(status)) {
      dispute.status = status;
      if (status === "resolved" || status === "dismissed") {
        dispute.resolvedAt = new Date();
      }
    }

    if (typeof resolutionNotes === "string") {
      dispute.resolutionNotes = resolutionNotes;
    }

    dispute.assignedAdminId = user.userId as unknown as typeof dispute.assignedAdminId;
    await dispute.save();

    await AuditLog.create({
      adminId: user.userId,
      action: "RESOLVE_DISPUTE",
      resourceType: "dispute",
      resourceId: disputeId,
      details: { status, resolutionNotes },
    });

    return NextResponse.json({
      message: "Dispute status updated successfully.",
      dispute,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update dispute error:", error);
    return NextResponse.json({ error: "Failed to update dispute" }, { status: 500 });
  }
}
