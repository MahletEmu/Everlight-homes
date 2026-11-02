import React from "react";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, VerificationRecord } from "@/lib/models";
import { IProperty, IVerificationRecord, IUser } from "@/types";
import { getSamplePropertyById, BAHIR_DAR_SAMPLE_PROPERTIES } from "@/lib/sampleProperties";
import { findMockUserById } from "@/lib/auth/mockUserStore";
import PropertyDetailClient from "./PropertyDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      await connectToDatabase();
      const property = await Property.findById(id).lean();
      if (property) {
        return {
          title: `${property.title} | Everlight Homes Bahir Dar`,
          description: property.description.slice(0, 160),
          openGraph: {
            title: `${property.title} | ETB ${property.monthlyRent?.toLocaleString()}/mo`,
            description: property.description.slice(0, 160),
            images: property.images?.[0]?.url ? [property.images[0].url] : [],
          },
        };
      }
    } catch {
      // Database offline, check local sample store
    }
  }

  const sample = getSamplePropertyById(id) || BAHIR_DAR_SAMPLE_PROPERTIES.find((p) => p._id === id);
  if (sample) {
    return {
      title: `${sample.title} | Everlight Homes Bahir Dar`,
      description: sample.description.slice(0, 160),
    };
  }

  return { title: "Rental Property in Bahir Dar | Everlight Homes" };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;

  let property: IProperty | null = null;
  let verification: IVerificationRecord | null = null;
  let similarProperties: IProperty[] = [];
  let landlord: IUser | null = null;

  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      await connectToDatabase();

      const rawProperty = await Property.findById(id)
        .populate("landlordId", "name email phone isVerified avatarUrl createdAt")
        .lean();

      if (rawProperty) {
        property = JSON.parse(JSON.stringify(rawProperty));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        landlord = (rawProperty.landlordId as any) ? JSON.parse(JSON.stringify(rawProperty.landlordId)) : null;

        const rawVerification = await VerificationRecord.findOne({ propertyId: id }).lean();
        if (rawVerification) {
          verification = JSON.parse(JSON.stringify(rawVerification));
        }

        const rawSimilar = await Property.find({
          _id: { $ne: id },
          city: property!.city,
          moderationStatus: "approved",
          availabilityStatus: "available",
        })
          .limit(3)
          .lean();

        similarProperties = JSON.parse(JSON.stringify(rawSimilar));
      }
    } catch (error) {
      console.warn("Database error, will check sample properties store:", error);
    }
  }

  if (!property) {
    const sample = getSamplePropertyById(id) || BAHIR_DAR_SAMPLE_PROPERTIES.find((p) => p._id === id);
    if (sample) {
      property = sample;
      if (typeof sample.landlordId === "object" && sample.landlordId !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        landlord = sample.landlordId as any;
      } else {
        const mockUser = findMockUserById(sample.landlordId);
        landlord = mockUser
          ? {
              _id: mockUser._id,
              name: mockUser.name,
              email: mockUser.email,
              phone: mockUser.phone || "+251 918 000 000",
              role: mockUser.role,
              accountStatus: mockUser.accountStatus,
              isVerified: mockUser.isVerified,
              createdAt: mockUser.createdAt,
              updatedAt: mockUser.updatedAt,
            }
          : {
              _id: String(sample.landlordId || "landlord-bd"),
              name: "Verified Landlord (የቤቱ ባለቤት)",
              email: "landlord@everlight.et",
              phone: "+251 918 123 456",
              role: "landlord",
              accountStatus: "active",
              isVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
      }

      verification = {
        _id: `ver-${sample._id}`,
        propertyId: sample._id,
        landlordId: landlord?._id || "landlord-bd",
        ownerVerificationStatus:
          sample.verificationStatus === "owner_verified" ||
          sample.verificationStatus === "fully_verified"
            ? "verified"
            : "pending",
        physicalInspectionStatus:
          sample.verificationStatus === "physically_inspected" ||
          sample.verificationStatus === "fully_verified"
            ? "inspected"
            : "not_requested",
        inspectionDate: new Date().toISOString(),
        notes: "Verified Bahir Dar rental residence.",
        documentProofUrls: [],
        createdAt: sample.createdAt || new Date().toISOString(),
        updatedAt: sample.updatedAt || new Date().toISOString(),
      };
      similarProperties = BAHIR_DAR_SAMPLE_PROPERTIES.filter((p) => p._id !== id).slice(0, 3);
    }
  }

  if (!property) {
    notFound();
  }

  return (
    <PropertyDetailClient
      property={property}
      landlord={landlord}
      verification={verification}
      similarProperties={similarProperties}
    />
  );
}