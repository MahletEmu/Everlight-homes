"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Bed, Bath, Maximize2, ArrowRight } from "lucide-react";
import { IProperty } from "@/types";
import VerificationBadge from "./VerificationBadge";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  property: IProperty;
  isFavorited?: boolean;
}

export default function PropertyCard({ property }: Props) {
  const { language } = useLanguage();
  const isAmharic = language === "am";

  const primaryImage =
    property.images?.find((img) => img.isPrimary)?.url ||
    property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="card-luxury rounded-2xl overflow-hidden flex flex-col group bg-white">
      {/* Property Thumbnail with Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        <Image
          src={primaryImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <span className="bg-[#0A1426]/90 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full shadow-sm">
            {isAmharic ? "የሚከራይ" : "For Rent"}
          </span>
          {property.featured && (
            <span className="bg-[#C59B38] text-white text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
              {isAmharic ? "ተመራጭ" : "Featured"}
            </span>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-2">
            <VerificationBadge tier={property.verificationStatus} />
          </div>

          <Link href={`/properties/${property._id}`} className="block group-hover:text-[#C59B38] transition-colors">
            <h3 className="text-lg font-bold text-[#0A1426] line-clamp-1">
              {property.title}
            </h3>
          </Link>

          <p className="flex items-center gap-1.5 text-xs text-stone-500 mt-1 mb-4">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="line-clamp-1">
              {property.neighborhood}, {isAmharic ? "ባህር ዳር" : property.city}
            </span>
          </p>

          {/* Feature Specs */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#C59B38]" />
              <span>
                {property.bedrooms} {isAmharic ? "መኝታ" : "Beds"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-[#C59B38]" />
              <span>
                {property.bathrooms} {isAmharic ? "መታጠቢያ" : "Baths"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-[#C59B38]" />
              <span>
                {property.sizeM2} {isAmharic ? "ካ.ሜ" : "m²"}
              </span>
            </div>
          </div>
        </div>

        {/* Price & View Link */}
        <div className="mt-4 pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 block">
              {isAmharic ? "የወር ኪራይ" : "Monthly Rent"}
            </span>
            <div className="text-lg font-extrabold text-[#0A1426]">
              {property.monthlyRent?.toLocaleString()}{" "}
              <span className="text-xs font-bold text-[#C59B38]">
                {isAmharic ? "ብር/ወር" : "ETB /mo"}
              </span>
            </div>
          </div>

          <Link
            href={`/properties/${property._id}`}
            aria-label={`View details of ${property.title}`}
            className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-[#0A1426] hover:text-white hover:border-[#0A1426] transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
