import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Favorite } from "@/lib/models";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDatabase();

    const favorites = await Favorite.find({ tenantId: user.userId })
      .populate({
        path: "propertyId",
        populate: { path: "landlordId", select: "name isVerified" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ favorites });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get favorites error:", error);
    return NextResponse.json({ error: "Failed to fetch saved properties" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await Favorite.findOne({
      tenantId: user.userId,
      propertyId,
    });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return NextResponse.json({ message: "Removed from favorites", isFavorite: false });
    } else {
      await Favorite.create({
        tenantId: user.userId,
        propertyId,
      });
      return NextResponse.json({ message: "Saved to favorites", isFavorite: true }, { status: 201 });
    }
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please sign in to save properties" }, { status: 401 });
    }
    console.error("Toggle favorite error:", error);
    return NextResponse.json({ error: "Failed to update favorite status" }, { status: 500 });
  }
}
