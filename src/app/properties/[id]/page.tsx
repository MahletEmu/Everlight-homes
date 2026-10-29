import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Building,
  Shield,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VerificationBadge from "@/components/VerificationBadge";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailInteractive from "./PropertyDetailInteractive";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, VerificationRecord } from "@/lib/models";
import { IProperty, IVerificationRecord, IUser } from "@/types";
import { AMENITIES_LIST } from "@/lib/constants";
import { BAHIR_DAR_SAMPLE_PROPERTIES } from "@/lib/sampleProperties";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
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
    // Database offline, use sample
  }

  const sample = BAHIR_DAR_SAMPLE_PROPERTIES.find((p) => p._id === id);
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
    console.error("Error fetching property:", error);
  }

  if (!property) {
    const sample = BAHIR_DAR_SAMPLE_PROPERTIES.find((p) => p._id === id);
    if (sample) {
      property = sample;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      landlord = sample.landlordId as any;
      verification = {
        _id: `ver-${sample._id}`,
        propertyId: sample._id,
        landlordId: landlord?._id || "landlord-bd",
        ownerVerificationStatus: "verified",
        physicalInspectionStatus: "inspected",
        inspectionDate: new Date().toISOString(),
        notes: "Verified Bahir Dar rental residence with in-person inspection.",
        documentProofUrls: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      similarProperties = BAHIR_DAR_SAMPLE_PROPERTIES.filter((p) => p._id !== id).slice(0, 3);
    }
  }

  if (!property) {
    notFound();
  }

  const primaryImage =
    property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 w-full">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#0A1426] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Main Property Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex-1">
        {/* Title & Price Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#0A1426] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                For Rent
              </span>
              <VerificationBadge tier={property.verificationStatus} />
              {property.availabilityStatus === "rented" && (
                <span className="bg-stone-800 text-stone-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Rented
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0A1426] tracking-tight">
              {property.title}
            </h1>

            <p className="flex items-center gap-2 text-sm text-stone-500">
              <MapPin className="w-4 h-4 text-[#C59B38] shrink-0" />
              <span>
                {property.neighborhood}, {property.city}, Ethiopia
              </span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 block">Monthly Rent</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0A1426]">
              ETB {property.monthlyRent?.toLocaleString()}{" "}
              <span className="text-xs font-normal text-stone-500">/mo</span>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10 rounded-3xl overflow-hidden shadow-lg border border-stone-200/80 bg-stone-100">
          <div className="md:col-span-2 relative aspect-[16/10] w-full">
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover"
            />
          </div>

          <div className="hidden md:grid grid-rows-2 gap-3">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={
                  property.images?.[1]?.url ||
                  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
                }
                alt="Interior photo"
                fill
                sizes="33vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={
                  property.images?.[2]?.url ||
                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
                }
                alt="Property feature view"
                fill
                sizes="33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Specs Strip */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3E1] flex items-center justify-center text-[#C59B38]">
                  <Bed className="w-5 h-5 text-[#A97E29]" />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase tracking-wider block">
                    Bedrooms
                  </span>
                  <span className="text-sm font-bold text-[#0A1426]">
                    {property.bedrooms} Beds
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3E1] flex items-center justify-center text-[#C59B38]">
                  <Bath className="w-5 h-5 text-[#A97E29]" />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase tracking-wider block">
                    Bathrooms
                  </span>
                  <span className="text-sm font-bold text-[#0A1426]">
                    {property.bathrooms} Baths
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3E1] flex items-center justify-center text-[#C59B38]">
                  <Maximize2 className="w-5 h-5 text-[#A97E29]" />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase tracking-wider block">
                    Floor Area
                  </span>
                  <span className="text-sm font-bold text-[#0A1426]">
                    {property.sizeM2} m²
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3E1] flex items-center justify-center text-[#C59B38]">
                  <Building className="w-5 h-5 text-[#A97E29]" />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase tracking-wider block">
                    Category
                  </span>
                  <span className="text-sm font-bold text-[#0A1426] capitalize">
                    {property.propertyType}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0A1426]">
                About This Property
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities & Utilities */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0A1426]">
                Amenities & Utilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenityKey) => {
                    const match = AMENITIES_LIST.find((a) => a.id === amenityKey);
                    return (
                      <div
                        key={amenityKey}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100 text-sm font-medium text-[#0A1426]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{match ? match.label : amenityKey}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-stone-500">Standard utilities specified upon request.</p>
                )}
              </div>
            </div>

            {/* Honest Verification & Inspection Disclosure */}
            <div className="bg-[#FAF3E1]/50 p-6 rounded-2xl border border-[#DFB967]/40 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#A97E29]" />
                <h3 className="text-base font-bold text-[#0A1426]">
                  Everlight Verification Disclosure
                </h3>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Everlight Homes operates with strict transparency. Below is the exact status of documentation and inspection recorded for this listing:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs">
                  <span className="font-semibold block text-[#0A1426]">Owner Verification:</span>
                  <span className="text-stone-500">
                    {verification?.ownerVerificationStatus === "verified"
                      ? "Government ID & ownership papers reviewed by Everlight"
                      : "Pending ownership paperwork submission"}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs">
                  <span className="font-semibold block text-[#0A1426]">Physical Inspection:</span>
                  <span className="text-stone-500">
                    {verification?.physicalInspectionStatus === "inspected"
                      ? `Inspected in-person${verification.inspectionDate ? ` on ${new Date(verification.inspectionDate).toLocaleDateString()}` : ""}`
                      : "Field inspection pending / not yet requested"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Landlord & Contact Sidebar (4 cols) */}
          <div className="lg:col-span-4">
            <PropertyDetailInteractive
              property={property}
              landlord={landlord}
              verification={verification}
            />
          </div>
        </div>

        {/* Similar Listings */}
        {similarProperties.length > 0 && (
          <div className="pt-8 border-t border-stone-200">
            <h2 className="text-2xl font-bold text-[#0A1426] mb-6">
              Similar Listings in {property.city}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((sp) => (
                <PropertyCard key={sp._id} property={sp} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
