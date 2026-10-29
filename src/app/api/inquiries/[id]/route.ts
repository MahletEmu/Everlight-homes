import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RentalInquiry } from "@/lib/models";
import { requireUser } from "@/lib/auth/session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const { status, landlordNote } = body;

    await connectToDatabase();

    const inquiry = await RentalInquiry.findById(id);
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const isLandlord = inquiry.landlordId.toString() === user.userId;
    const isTenant = inquiry.tenantId.toString() === user.userId;
    const isAdmin = user.role === "admin";

    if (!isLandlord && !isTenant && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};

    if (isLandlord || isAdmin) {
      if (
        status &&
        ["pending", "accepted", "declined", "viewing_scheduled", "completed"].includes(status)
      ) {
        updates.status = status;
      }
      if (typeof landlordNote === "string") {
        updates.landlordNote = landlordNote;
      }
    } else if (isTenant) {
      // Tenants can withdraw their inquiry
      if (status === "declined") {
        updates.status = "declined";
      }
    }

    const updated = await RentalInquiry.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json({
      message: "Inquiry status updated successfully",
      inquiry: updated,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update inquiry error:", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
