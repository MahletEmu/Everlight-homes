import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RentalInquiry, Property } from "@/lib/models";
import { requireUser } from "@/lib/auth/session";
import { InquirySchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filter: Record<string, any> = {};

    if (user.role === "tenant") {
      filter = { tenantId: user.userId };
    } else if (user.role === "landlord") {
      filter = { landlordId: user.userId };
    } else if (user.role === "admin") {
      filter = {};
    }

    const inquiries = await RentalInquiry.find(filter)
      .populate("propertyId", "title city neighborhood monthlyRent images availabilityStatus")
      .populate("tenantId", "name email phone")
      .populate("landlordId", "name phone isVerified")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ inquiries });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get inquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch rental inquiries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const parsed = InquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { propertyId, message, requestedViewingDate } = parsed.data;

    await connectToDatabase();

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.landlordId.toString() === user.userId) {
      return NextResponse.json(
        { error: "You cannot submit an inquiry for your own property." },
        { status: 400 }
      );
    }

    const inquiry = await RentalInquiry.create({
      propertyId,
      tenantId: user.userId,
      landlordId: property.landlordId,
      message,
      requestedViewingDate: requestedViewingDate ? new Date(requestedViewingDate) : undefined,
      status: "pending",
    });

    return NextResponse.json(
      { message: "Rental inquiry submitted successfully", inquiry },
      { status: 201 }
    );
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please sign in to contact the landlord" }, { status: 401 });
    }
    console.error("Create inquiry error:", error);
    return NextResponse.json({ error: "Failed to submit rental inquiry" }, { status: 500 });
  }
}
