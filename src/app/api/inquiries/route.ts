import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { RentalInquiry, Property } from "@/lib/models";
import { requireUser } from "@/lib/auth/session";
import { InquirySchema } from "@/lib/validation";
import { BAHIR_DAR_SAMPLE_PROPERTIES } from "@/lib/sampleProperties";

interface MockInquiry {
  _id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propertyId: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenantId: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  landlordId: any;
  message: string;
  requestedViewingDate?: Date;
  status: "pending" | "viewing_scheduled" | "accepted" | "declined";
  createdAt: string;
}

declare global {
  var globalMockInquiries: MockInquiry[] | undefined;
}

const mockInquiriesStore: MockInquiry[] = global.globalMockInquiries || [];
if (!global.globalMockInquiries) {
  global.globalMockInquiries = mockInquiriesStore;
}

export async function GET() {
  try {
    const user = await requireUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filter: Record<string, any> = {};

    if (user.role === "tenant") {
      filter = { tenantId: user.userId };
    } else if (user.role === "landlord") {
      filter = { landlordId: user.userId };
    } else if (user.role === "admin") {
      filter = {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbInquiries: any[] = [];
    try {
      await connectToDatabase();
      dbInquiries = await RentalInquiry.find(filter)
        .populate("propertyId", "title city neighborhood monthlyRent images availabilityStatus")
        .populate("tenantId", "name email phone")
        .populate("landlordId", "name phone isVerified")
        .sort({ createdAt: -1 })
        .lean();
    } catch (dbErr) {
      console.warn("Database offline for inquiries, serving resilient store:", dbErr);
    }

    // Filter mock inquiries for this user
    const relevantMockInquiries = mockInquiriesStore.filter((inq) => {
      if (user.role === "tenant") return inq.tenantId?._id === user.userId;
      if (user.role === "landlord") return inq.landlordId?._id === user.userId;
      return true; // admin sees all
    });

    const combined = [...dbInquiries, ...relevantMockInquiries];
    return NextResponse.json({ inquiries: combined });
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

    // 1. Locate Property (Sample Properties OR MongoDB)
    const sampleProperty = BAHIR_DAR_SAMPLE_PROPERTIES.find((p) => p._id === propertyId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbProperty: any = null;

    if (!sampleProperty && mongoose.Types.ObjectId.isValid(propertyId)) {
      try {
        await connectToDatabase();
        dbProperty = await Property.findById(propertyId);
      } catch (e) {
        console.warn("Database lookup failed for property inquiry:", e);
      }
    }

    const targetProperty = sampleProperty || dbProperty;
    if (!targetProperty) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Extract Landlord Identifier
    const landlordId = sampleProperty
      ? (typeof sampleProperty.landlordId === "object" ? sampleProperty.landlordId._id : sampleProperty.landlordId)
      : dbProperty?.landlordId;

    if (landlordId && landlordId.toString() === user.userId) {
      return NextResponse.json(
        { error: "You cannot submit an inquiry for your own property." },
        { status: 400 }
      );
    }

    // 2. If it's a real MongoDB property and DB is reachable, persist to MongoDB
    if (!sampleProperty && mongoose.Types.ObjectId.isValid(propertyId)) {
      try {
        await connectToDatabase();
        const inquiry = await RentalInquiry.create({
          propertyId,
          tenantId: user.userId,
          landlordId,
          message,
          requestedViewingDate: requestedViewingDate ? new Date(requestedViewingDate) : undefined,
          status: "pending",
        });

        return NextResponse.json(
          { message: "Rental inquiry submitted successfully", inquiry },
          { status: 201 }
        );
      } catch (dbErr) {
        console.warn("Saving to MongoDB failed, storing in mock fallback:", dbErr);
      }
    }

    // 3. Resilient In-Memory Storage (for sample properties or offline DB)
    const mockInquiry: MockInquiry = {
      _id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      propertyId: {
        _id: targetProperty._id,
        title: targetProperty.title,
        city: targetProperty.city,
        neighborhood: targetProperty.neighborhood,
        monthlyRent: targetProperty.monthlyRent,
        images: targetProperty.images || [],
        availabilityStatus: targetProperty.availabilityStatus || "available",
      },
      tenantId: {
        _id: user.userId,
        name: user.email.split("@")[0] || "Prospective Tenant",
        email: user.email,
        phone: "+251 900 000 000",
      },
      landlordId: {
        _id: landlordId || "landlord-bd",
        name: typeof sampleProperty?.landlordId === "object" ? (sampleProperty.landlordId as any).name : "Bahir Dar Property Host",
        phone: typeof sampleProperty?.landlordId === "object" ? (sampleProperty.landlordId as any).phone : "+251 937 762 030",
        isVerified: true,
      },
      message,
      requestedViewingDate: requestedViewingDate ? new Date(requestedViewingDate) : undefined,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    mockInquiriesStore.unshift(mockInquiry);

    return NextResponse.json(
      { message: "Rental inquiry submitted successfully", inquiry: mockInquiry },
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
