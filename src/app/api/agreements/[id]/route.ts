import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RentalAgreement, Property, CommissionRecord } from "@/lib/models";
import { requireUser } from "@/lib/auth/session";
import { calculateCommission } from "@/lib/commission";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    await connectToDatabase();

    const agreement = await RentalAgreement.findById(id)
      .populate("propertyId")
      .populate("tenantId", "name email phone")
      .populate("landlordId", "name email phone isVerified")
      .populate("commissionRecordId")
      .lean();

    if (!agreement) {
      return NextResponse.json({ error: "Rental agreement not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const landlordIdStr = (agreement.landlordId as any)?._id?.toString() || agreement.landlordId.toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantIdStr = (agreement.tenantId as any)?._id?.toString() || agreement.tenantId.toString();

    const isParty = user.userId === landlordIdStr || user.userId === tenantIdStr;
    const isAdmin = user.role === "admin";

    if (!isParty && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ agreement });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get agreement error:", error);
    return NextResponse.json({ error: "Failed to fetch rental agreement" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const { action, cancellationReason } = body; // action: "confirm" | "cancel"

    await connectToDatabase();

    const agreement = await RentalAgreement.findById(id);
    if (!agreement) {
      return NextResponse.json({ error: "Rental agreement not found" }, { status: 404 });
    }

    const landlordIdStr = agreement.landlordId.toString();
    const tenantIdStr = agreement.tenantId.toString();
    const isLandlord = user.userId === landlordIdStr;
    const isTenant = user.userId === tenantIdStr;
    const isAdmin = user.role === "admin";

    if (!isLandlord && !isTenant && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "cancel") {
      if (agreement.status === "completed") {
        return NextResponse.json(
          { error: "Completed agreements cannot be cancelled directly. Please file a dispute." },
          { status: 400 }
        );
      }
      agreement.status = "cancelled";
      agreement.cancellationReason =
        cancellationReason || `Agreement cancelled by ${user.role} (${user.name})`;
      await agreement.save();

      return NextResponse.json({
        message: "Rental agreement has been cancelled.",
        agreement,
      });
    }

    if (action === "confirm") {
      if (agreement.status === "cancelled") {
        return NextResponse.json(
          { error: "Cannot confirm an already cancelled agreement." },
          { status: 400 }
        );
      }

      const now = new Date();

      if (isTenant || isAdmin) {
        agreement.tenantConfirmed = true;
        agreement.tenantConfirmedAt = now;
      }
      if (isLandlord || isAdmin) {
        agreement.landlordConfirmed = true;
        agreement.landlordConfirmedAt = now;
      }

      // Check if BOTH parties have now confirmed
      if (agreement.tenantConfirmed && agreement.landlordConfirmed) {
        agreement.status = "completed";

        // Mark property as rented
        await Property.findByIdAndUpdate(agreement.propertyId, {
          availabilityStatus: "rented",
        });

        // Trigger Commission Calculation Workflow
        // Check for existing commission record to ensure strict idempotency
        let commission = await CommissionRecord.findOne({ agreementId: agreement._id });

        if (!commission) {
          const calc = calculateCommission(agreement.agreedRent);

          commission = await CommissionRecord.create({
            agreementId: agreement._id,
            propertyId: agreement.propertyId,
            payerId: calc.payerRole === "landlord" ? agreement.landlordId : agreement.tenantId,
            payerRole: calc.payerRole,
            commissionBasis: calc.basis,
            ratePercentage: calc.ratePercentage,
            amountETB: calc.amountETB,
            paymentStatus: "pending",
            dueDate: calc.dueDate,
          });

          agreement.commissionRecordId = commission._id;
        }
      }

      await agreement.save();

      return NextResponse.json({
        message:
          agreement.status === "completed"
            ? "Rental agreement confirmed by both parties! Agreement is now completed."
            : "Confirmation recorded. Awaiting final confirmation.",
        agreement,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Agreement action error:", error);
    return NextResponse.json({ error: "Failed to process agreement action" }, { status: 500 });
  }
}
