import React from "react";
import HomePageClient from "@/components/HomePageClient";
import { connectToDatabase } from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { IProperty } from "@/types";
import { BAHIR_DAR_SAMPLE_PROPERTIES } from "@/lib/sampleProperties";

export const dynamic = "force-dynamic";

async function getFeaturedProperties(): Promise<IProperty[]> {
  try {
    await connectToDatabase();
    const properties = await Property.find({
      moderationStatus: "approved",
      availabilityStatus: "available",
      city: "Bahir Dar",
    })
      .sort({ featured: -1, createdAt: -1 })
      .limit(3)
      .lean();

    if (properties && properties.length > 0) {
      return JSON.parse(JSON.stringify(properties)) as unknown as IProperty[];
    }
  } catch (e) {
    console.warn("Database not connected or empty, falling back to curated Bahir Dar list:", e);
  }
  return BAHIR_DAR_SAMPLE_PROPERTIES.slice(0, 3);
}

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();
  return <HomePageClient featuredProperties={featuredProperties} />;
}
