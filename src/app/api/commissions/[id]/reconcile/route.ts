import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CommissionRecord, AuditLog } from "@/lib/models";
import { requireRole } from "@/lib/auth/session";
import { CommissionReconcileSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(["admin"]);
    const { id } = await params;
    const body = await req.json();

    const parsed = CommissionReconcileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { paymentStatus, paymentReference, paymentMethod, reconciledNotes } = parsed.data;

    await connectToDatabase();

    const commission = await CommissionRecord.findById(id);
    if (!commission) {
      return NextResponse.json({ error: "Commission record not found" }, { status: 404 });
    }

    if (commission.paymentStatus === "paid" && paymentStatus === "paid") {
      return NextResponse.json(
        { error: "This commission has already been reconciled as paid. Duplicate reconciliation is not allowed." },
        { status: 400 }
      );
    }

    commission.paymentStatus = paymentStatus;
    commission.paymentReference = paymentReference;
    commission.paymentMethod = paymentMethod;
    commission.reconciledByAdminId = admin.userId as unknown as typeof commission.reconciledByAdminId;
    commission.reconciledNotes = reconciledNotes;

    if (paymentStatus === "paid") {
      commission.paidAt = new Date();
    }

    await commission.save();

    // Create auditable admin log
    await AuditLog.create({
      adminId: admin.userId,
      action: "RECONCILE_COMMISSION_PAYMENT",
      resourceType: "commission",
      resourceId: id,
      details: {
        paymentStatus,
        paymentReference,
        paymentMethod,
        amountETB: commission.amountETB,
        reconciledNotes,
      },
    });

    return NextResponse.json({
      message: "Commission payment successfully reconciled.",
      commission,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "FORBIDDEN" || (error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Administrator authorization required" }, { status: 403 });
    }
    console.error("Reconcile commission error:", error);
    return NextResponse.json({ error: "Failed to reconcile commission" }, { status: 500 });
  }
}
