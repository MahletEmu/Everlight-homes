import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, VerificationRecord } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth/session";
import { PropertySchema } from "@/lib/validation";
import { BAHIR_DAR_SAMPLE_PROPERTIES } from "@/lib/sampleProperties";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getCurrentUser();

    const q = searchParams.get("q") || searchParams.get("search") || searchParams.get("query");
    const neighborhood = searchParams.get("neighborhood") || searchParams.get("location");
    const city = searchParams.get("city") || "Bahir Dar";
    const propertyType = searchParams.get("propertyType");
    const minRent = searchParams.get("minRent");
    const maxRent = searchParams.get("maxRent");
    const bedrooms = searchParams.get("bedrooms");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const featured = searchParams.get("featured");
    const mine = searchParams.get("mine") === "true";
    const adminView = searchParams.get("adminView") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (mine && session) {
      filter.landlordId = session.userId;
    } else if (adminView && session?.role === "admin") {
      const moderation = searchParams.get("moderationStatus");
      if (moderation) filter.moderationStatus = moderation;
    } else {
      filter.moderationStatus = "approved";
      filter.availabilityStatus = "available";
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
        { neighborhood: { $regex: regex } },
      ];
    }

    if (neighborhood && neighborhood !== "All" && neighborhood !== "Any" && neighborhood !== "all") {
      filter.neighborhood = { $regex: new RegExp(neighborhood.trim(), "i") };
    }

    if (city && city !== "All" && city !== "Any" && city !== "all") {
      filter.city = { $regex: new RegExp(city.trim(), "i") };
    }

    if (propertyType && propertyType !== "Any" && propertyType !== "all") {
      filter.propertyType = propertyType;
    }

    if (minRent || maxRent) {
      filter.monthlyRent = {};
      if (minRent) filter.monthlyRent.$gte = Number(minRent);
      if (maxRent && maxRent !== "all") filter.monthlyRent.$lte = Number(maxRent);
    }

    if (bedrooms && bedrooms !== "any") {
      const beds = Number(bedrooms);
      if (beds >= 4) {
        filter.bedrooms = { $gte: 4 };
      } else if (beds > 0) {
        filter.bedrooms = beds;
      }
    }

    if (featured === "true") {
      filter.featured = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortQuery: Record<string, any> = { createdAt: -1 };
    if (sort === "rent_asc") sortQuery = { monthlyRent: 1 };
    if (sort === "rent_desc") sortQuery = { monthlyRent: -1 };
    if (sort === "oldest") sortQuery = { createdAt: 1 };

    const skip = (page - 1) * limit;

    let dbProperties: unknown[] = [];
    let dbTotal = 0;
    let isDbConnected = false;

    try {
      await connectToDatabase();
      isDbConnected = true;

      const [properties, total] = await Promise.all([
        Property.find(filter)
          .sort(sortQuery)
          .skip(skip)
          .limit(limit)
          .populate("landlordId", "name isVerified")
          .lean(),
        Property.countDocuments(filter),
      ]);

      dbProperties = properties;
      dbTotal = total;
    } catch (dbErr) {
      console.warn("Database offline or unconfigured, utilizing Bahir Dar rental portfolio:", dbErr);
    }

    // If database returned valid records, serve them
    if (isDbConnected && dbTotal > 0) {
      return NextResponse.json({
        properties: dbProperties,
        pagination: {
          total: dbTotal,
          page,
          limit,
          totalPages: Math.ceil(dbTotal / limit),
        },
      });
    }

    // Resilient fallback to curated Bahir Dar properties filtered by user query
    let fallback = [...BAHIR_DAR_SAMPLE_PROPERTIES];

    if (q && q.trim()) {
      const lower = q.trim().toLowerCase();
      fallback = fallback.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.neighborhood.toLowerCase().includes(lower) ||
          p.propertyType.toLowerCase().includes(lower)
      );
    }

    if (neighborhood && neighborhood !== "All" && neighborhood !== "Any" && neighborhood !== "all") {
      const lower = neighborhood.toLowerCase();
      fallback = fallback.filter(
        (p) =>
          p.neighborhood.toLowerCase().includes(lower) ||
          p.title.toLowerCase().includes(lower)
      );
    }

    if (propertyType && propertyType !== "Any" && propertyType !== "all") {
      fallback = fallback.filter((p) => p.propertyType === propertyType);
    }

    if (minRent) {
      const min = Number(minRent);
      if (!isNaN(min) && min > 0) {
        fallback = fallback.filter((p) => p.monthlyRent >= min);
      }
    }

    if (maxRent && maxRent !== "all") {
      const max = Number(maxRent);
      if (!isNaN(max) && max > 0) {
        fallback = fallback.filter((p) => p.monthlyRent <= max);
      }
    }

    if (bedrooms && bedrooms !== "any") {
      const beds = Number(bedrooms);
      if (beds >= 4) {
        fallback = fallback.filter((p) => p.bedrooms >= 4);
      } else if (beds > 0) {
        fallback = fallback.filter((p) => p.bedrooms === beds);
      }
    }

    if (featured === "true") {
      fallback = fallback.filter((p) => p.featured);
    }

    if (sort === "rent_asc") {
      fallback.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (sort === "rent_desc") {
      fallback.sort((a, b) => b.monthlyRent - a.monthlyRent);
    } else if (sort === "oldest") {
      fallback.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      fallback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const paged = fallback.slice(skip, skip + limit);

    return NextResponse.json({
      properties: paged,
      pagination: {
        total: fallback.length,
        page,
        limit,
        totalPages: Math.ceil(fallback.length / limit),
      },
    });
  } catch (error) {
    console.error("Get properties error:", error);
    return NextResponse.json(
      { error: "Failed to load properties" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "landlord" && session.role !== "admin")) {
      return NextResponse.json(
        { error: "Unauthorized. Landlord or Administrator account required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = PropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const isAutoApproved = session.role === "admin";

    const property = await Property.create({
      ...parsed.data,
      landlordId: session.userId,
      moderationStatus: isAutoApproved ? "approved" : "pending_review",
      availabilityStatus: "available",
      verificationStatus: "unverified",
    });

    // Create tracking verification record for administration
    await VerificationRecord.create({
      propertyId: property._id,
      landlordId: session.userId,
      ownerVerificationStatus: "pending",
      physicalInspectionStatus: "not_requested",
      notes: "Newly submitted listing queued for verification.",
    });

    return NextResponse.json(
      {
        message: isAutoApproved
          ? "Property listed and published successfully"
          : "Property created and submitted for review by Everlight moderators",
        property,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create property error:", error);
    return NextResponse.json(
      { error: "Failed to create property listing" },
      { status: 500 }
    );
  }
}
