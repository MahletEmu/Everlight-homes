import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RentalAgreement, Property, User } from "@/lib/models";
import { requireUser } from "@/lib/auth/session";
import { AgreementSchema } from "@/lib/validation";

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

    const agreements = await RentalAgreement.find(filter)
      .populate("propertyId", "title city neighborhood monthlyRent images")
      .populate("tenantId", "name email phone")
      .populate("landlordId", "name email phone isVerified")
      .populate("commissionRecordId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ agreements });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get agreements error:", error);
    return NextResponse.json({ error: "Failed to fetch rental agreements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const parsed = AgreementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { propertyId, tenantId, agreedRent, deposit, startDate, durationMonths } = parsed.data;

    await connectToDatabase();

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Only property owner or admin can initiate the agreement proposal
    const isOwner = property.landlordId.toString() === user.userId;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only the verified property owner or administrator can draft a rental agreement." },
        { status: 403 }
      );
    }

    const tenant = await User.findById(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: "Selected tenant was not found." }, { status: 404 });
    }

    const now = new Date();

    const agreement = await RentalAgreement.create({
      propertyId,
      landlordId: property.landlordId,
      tenantId,
      agreedRent,
      deposit,
      startDate: new Date(startDate),
      durationMonths,
      landlordConfirmed: true, // Landlord drafted and confirms
      tenantConfirmed: false, // Awaiting tenant confirmation
      landlordConfirmedAt: now,
      status: "pending_confirmation",
    });

    return NextResponse.json(
      {
        message: "Rental agreement proposal created. Awaiting tenant confirmation.",
        agreement,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create agreement error:", error);
    return NextResponse.json({ error: "Failed to create rental agreement" }, { status: 500 });
  }
}
