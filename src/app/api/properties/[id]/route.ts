import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, VerificationRecord } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth/session";
import { PropertySchema } from "@/lib/validation";

import { BAHIR_DAR_SAMPLE_PROPERTIES } from "@/lib/sampleProperties";
import { IProperty, IVerificationRecord } from "@/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    let dbProperty: (IProperty & { landlordId?: { _id?: string; name?: string } | string }) | null = null;
    let dbVerification: Partial<IVerificationRecord> | null = null;
    let dbSimilar: IProperty[] = [];

    try {
      await connectToDatabase();

      const rawProp = await Property.findById(id)
        .populate("landlordId", "name isVerified avatarUrl createdAt")
        .lean();
      dbProperty = rawProp ? (rawProp as unknown as (IProperty & { landlordId?: { _id?: string; name?: string } | string })) : null;

      if (dbProperty) {
        const rawVer = await VerificationRecord.findOne({ propertyId: id })
          .select("ownerVerificationStatus physicalInspectionStatus inspectionDate notes")
          .lean();
        dbVerification = rawVer ? (rawVer as unknown as Partial<IVerificationRecord>) : null;

        const rawSim = await Property.find({
          _id: { $ne: id },
          city: dbProperty.city,
          moderationStatus: "approved",
          availabilityStatus: "available",
        })
          .limit(3)
          .lean();
        dbSimilar = rawSim ? (rawSim as unknown as IProperty[]) : [];
      }
    } catch {
      // Database offline, use sample portfolio
    }

    if (dbProperty) {
      const landlordIdStr =
        typeof dbProperty.landlordId === "object" && dbProperty.landlordId !== null && "_id" in dbProperty.landlordId
          ? String(dbProperty.landlordId._id)
          : String(dbProperty.landlordId || "");
      const isOwner = session && session.userId === landlordIdStr;
      const isAdmin = session && session.role === "admin";

      if (!isOwner && !isAdmin) {
        if (
          dbProperty.moderationStatus !== "approved" ||
          dbProperty.availabilityStatus !== "available"
        ) {
          return NextResponse.json(
            { error: "Property is currently not available for viewing" },
            { status: 403 }
          );
        }
      }

      return NextResponse.json({
        property: dbProperty,
        verification: dbVerification,
        similarProperties: dbSimilar,
        canEdit: Boolean(isOwner || isAdmin),
      });
    }

    // Lookup in Bahir Dar curated portfolio
    const sample = BAHIR_DAR_SAMPLE_PROPERTIES.find((p) => p._id === id);
    if (sample) {
      const similar = BAHIR_DAR_SAMPLE_PROPERTIES.filter((p) => p._id !== id).slice(0, 3);
      return NextResponse.json({
        property: sample,
        verification: {
          ownerVerificationStatus: "verified",
          physicalInspectionStatus: "inspected",
          inspectionDate: new Date().toISOString(),
          notes: "Verified Bahir Dar rental residence.",
        },
        similarProperties: similar,
        canEdit: false,
      });
    }

    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  } catch (error) {
    console.error("Get property error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwner = property.landlordId.toString() === session.userId;
    const isAdmin = session.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. You can only edit your own listings." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = PropertySchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // If landlord updates critical fields, reset to pending_review unless admin
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (!isAdmin && (parsed.data.monthlyRent || parsed.data.title || parsed.data.city)) {
      updateData.moderationStatus = "pending_review";
    }

    if (body.availabilityStatus && ["available", "rented", "withdrawn"].includes(body.availabilityStatus)) {
      updateData.availabilityStatus = body.availabilityStatus;
    }

    const updated = await Property.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      message: "Property updated successfully",
      property: updated,
    });
  } catch (error) {
    console.error("Update property error:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwner = property.landlordId.toString() === session.userId;
    const isAdmin = session.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. You can only delete your own listings." },
        { status: 403 }
      );
    }

    await Property.findByIdAndDelete(id);

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
