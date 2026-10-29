"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { IProperty } from "@/types";
import { BAHIR_DAR_NEIGHBORHOODS, PROPERTY_TYPES, AMENITIES_LIST } from "@/lib/constants";
import { BAHIR_DAR_SAMPLE_PROPERTIES } from "@/lib/sampleProperties";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function PropertiesDirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const isAmharic = language === "am";

  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters State — Focused strictly on Bahir Dar neighborhoods & rental criteria
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [neighborhood, setNeighborhood] = useState(
    searchParams.get("neighborhood") || searchParams.get("city") || ""
  );
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "");
  const [minRent, setMinRent] = useState(searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(searchParams.get("maxRent") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("city", "Bahir Dar");
      if (q.trim()) params.set("q", q.trim());
      if (neighborhood && neighborhood !== "all" && neighborhood !== "Bahir Dar") {
        params.set("neighborhood", neighborhood);
      }
      if (propertyType && propertyType !== "all") params.set("propertyType", propertyType);
      if (minRent) params.set("minRent", minRent);
      if (maxRent && maxRent !== "all") params.set("maxRent", maxRent);
      if (bedrooms && bedrooms !== "any") params.set("bedrooms", bedrooms);
      if (sort) params.set("sort", sort);

      try {
        const res = await fetch(`/api/properties?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Unable to reach properties server");
        }
        const data = await res.json();

        let filtered = data.properties || [];
        if (selectedAmenities.length > 0) {
          filtered = filtered.filter((p: IProperty) =>
            selectedAmenities.every((a) => p.amenities?.includes(a))
          );
        }

        setProperties(filtered);
      } catch (err: unknown) {
        console.warn("Client fallback to Bahir Dar rental portfolio:", err);
        // Resilient fallback — ensure user never sees a broken empty red screen
        let fallback = [...BAHIR_DAR_SAMPLE_PROPERTIES];

        if (q.trim()) {
          const lower = q.trim().toLowerCase();
          fallback = fallback.filter(
            (p) =>
              p.title.toLowerCase().includes(lower) ||
              p.description.toLowerCase().includes(lower) ||
              p.neighborhood.toLowerCase().includes(lower) ||
              p.propertyType.toLowerCase().includes(lower)
          );
        }

        if (neighborhood && neighborhood !== "all" && neighborhood !== "Bahir Dar") {
          const lower = neighborhood.toLowerCase();
          fallback = fallback.filter(
            (p) =>
              p.neighborhood.toLowerCase().includes(lower) ||
              p.title.toLowerCase().includes(lower)
          );
        }

        if (propertyType && propertyType !== "all") {
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

        if (selectedAmenities.length > 0) {
          fallback = fallback.filter((p) =>
            selectedAmenities.every((a) => p.amenities?.includes(a))
          );
        }

        if (sort === "rent_asc") {
          fallback.sort((a, b) => a.monthlyRent - b.monthlyRent);
        } else if (sort === "rent_desc") {
          fallback.sort((a, b) => b.monthlyRent - a.monthlyRent);
        } else {
          fallback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setProperties(fallback);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [q, neighborhood, propertyType, minRent, maxRent, bedrooms, sort, selectedAmenities]);

  const handleResetFilters = () => {
    setQ("");
    setNeighborhood("");
    setPropertyType("");
    setMinRent("");
    setMaxRent("");
    setBedrooms("");
    setSort("newest");
    setSelectedAmenities([]);
    router.push("/properties");
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#0A1426] text-white py-12 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DFB967] block mb-2">
            {isAmharic ? "የባህር ዳር የቤት ኪራይ · አስተማማኝ ደላላ" : "BAHIR DAR RENTALS · VERIFIED BROKERAGE"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {isAmharic ? "በባህር ዳር የተረጋገጡ የኪራይ ቤቶች" : "Verified Rental Properties in Bahir Dar"}
          </h1>
          <p className="text-stone-300 text-sm mt-2 max-w-2xl leading-relaxed">
            {isAmharic
              ? "በጣና ሐይቅ ዳርቻ፣ ዲያስፖራ መንደር፣ በላይ ዘለቀ፣ አባይ ማዶ፣ ቀበሌ 03 እና በሁሉም የባህር ዳር ቀበሌዎች የሚከራዩ አስተማማኝ ቤቶች በኢትዮጵያ ብር።"
              : "Professional rental brokerage across Lake Tana Shore, Diaspora Village, Belay Zeleke, Abay Mado, Kebele 03, and all Bahir Dar neighborhoods. Transparent monthly pricing in ETB."}
          </p>
        </div>
      </div>

      {/* Main Content with Sidebar Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* PROMINENT SEARCH BAR (Full Width) */}
        <div className="mb-8 bg-white p-4 sm:p-6 rounded-3xl border-2 border-[#DFB967]/40 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const params = new URLSearchParams(searchParams.toString());
              if (q.trim()) params.set("q", q.trim());
              else params.delete("q");
              router.push(`/properties?${params.toString()}`);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1 flex items-center bg-stone-50 rounded-2xl border-2 border-stone-200 focus-within:border-[#C59B38] focus-within:bg-white transition-all px-4 py-3 shadow-inner">
              <Search className="w-5 h-5 text-[#C59B38] shrink-0 mr-3" />
              <input
                id="properties-search-input"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  isAmharic
                    ? "የሚፈልጉትን ቤት፣ ቀበሌ ወይም አይነት እዚህ ይፈልጉ (ለምሳሌ፡ ቪላ፣ ጣና ሐይቅ፣ ዲያስፖራ)..."
                    : "Search rentals by title, kebele, or property type (e.g. Lake Tana, Villa, Apartment)..."
                }
                className="w-full bg-transparent text-sm sm:text-base font-medium text-[#0A1426] placeholder:text-stone-400 focus:outline-none"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("q");
                    router.push(`/properties?${params.toString()}`);
                  }}
                  className="p-1 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
                  title={isAmharic ? "አጽዳ" : "Clear search"}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn-gold px-8 py-3.5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Search className="w-4 h-4" />
              <span>{isAmharic ? "ፈልግ" : "Search"}</span>
            </button>
          </form>

          {/* Quick Kebele Filter Chips */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
              {isAmharic ? "አካባቢዎች፦" : "Popular Areas:"}
            </span>
            <button
              type="button"
              onClick={() => setNeighborhood("")}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                !neighborhood || neighborhood === "all"
                  ? "bg-[#0A1426] text-[#DFB967] shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {isAmharic ? "መላው ባህር ዳር (ሁሉም)" : "All Areas"}
            </button>
            {BAHIR_DAR_NEIGHBORHOODS.slice(0, 7).map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setNeighborhood(area)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                  neighborhood === area
                    ? "bg-[#C59B38] text-white shadow-sm ring-2 ring-[#DFB967]"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          {/* Active Search & Filter Tags */}
          {(q || (neighborhood && neighborhood !== "all")) && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-stone-400">{isAmharic ? "ገባሪ ማጣሪያ፦" : "Active filter:"}</span>
              {q && (
                <span className="inline-flex items-center gap-1 bg-[#FAF3E1] text-[#A97E29] font-bold px-2.5 py-1 rounded-full border border-[#DFB967]/30">
                  <span>{isAmharic ? "ፍለጋ" : "Query"}: &ldquo;{q}&rdquo;</span>
                  <button type="button" onClick={() => setQ("")} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {neighborhood && neighborhood !== "all" && (
                <span className="inline-flex items-center gap-1 bg-[#FAF3E1] text-[#A97E29] font-bold px-2.5 py-1 rounded-full border border-[#DFB967]/30">
                  <span>{isAmharic ? "ቀበሌ" : "Area"}: {neighborhood}</span>
                  <button type="button" onClick={() => setNeighborhood("")} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span className="text-sm font-bold text-[#0A1426]">
            {isAmharic ? `${properties.length} የባህር ዳር ቤቶች ተገኝተዋል` : `${properties.length} Listings in Bahir Dar`}
          </span>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="btn-navy px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#DFB967]" />
            <span>{isAmharic ? "ማጣሪያዎች" : "Filters"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <aside
            className={`lg:block ${
              mobileFilterOpen ? "block" : "hidden"
            } bg-white p-6 rounded-2xl border border-stone-200 shadow-sm h-fit space-y-6`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-bold text-[#0A1426] flex items-center gap-2 text-base">
                <Filter className="w-4 h-4 text-[#C59B38]" />
                <span>{isAmharic ? "ዝርዝር ማጣሪያ" : "Filter Search"}</span>
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#C59B38] hover:underline flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isAmharic ? "ዳግም ጀምር" : "Reset"}</span>
              </button>
            </div>

            {/* Bahir Dar Area Filter */}
            <div>
              <label htmlFor="filter-neighborhood" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-2">
                {isAmharic ? "ቀበሌ / አካባቢ (ባህር ዳር)" : "Bahir Dar Area / Kebele"}
              </label>
              <select
                id="filter-neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
              >
                <option value="">{isAmharic ? "መላው ባህር ዳር (ሁሉም)" : "All Bahir Dar Areas"}</option>
                {BAHIR_DAR_NEIGHBORHOODS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <label htmlFor="filter-property-type" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-2">
                {isAmharic ? "የቤት አይነት" : "Property Category"}
              </label>
              <select
                id="filter-property-type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
              >
                <option value="">{isAmharic ? "ሁሉም አይነቶች" : "All Categories"}</option>
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter (ETB) */}
            <div>
              <label htmlFor="filter-min-rent" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-2">
                {isAmharic ? "የወር ኪራይ (በብር)" : "Monthly Rent (ETB)"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="filter-min-rent"
                  type="number"
                  placeholder={isAmharic ? "ዝቅተኛ ብር" : "Min Br"}
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none"
                />
                <input
                  id="filter-max-rent"
                  aria-label={isAmharic ? "ከፍተኛ የኪራይ ዋጋ በብር" : "Maximum rent in ETB"}
                  type="number"
                  placeholder={isAmharic ? "ከፍተኛ ብር" : "Max Br"}
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Bedrooms Filter */}
            <div>
              <label htmlFor="filter-bedrooms" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-2">
                {isAmharic ? "መኝታ ክፍሎች" : "Bedrooms"}
              </label>
              <select
                id="filter-bedrooms"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
              >
                <option value="">{isAmharic ? "ማንኛውም መኝታ" : "Any Bedrooms"}</option>
                <option value="1">{isAmharic ? "1 መኝታ" : "1 Bedroom"}</option>
                <option value="2">{isAmharic ? "2 መኝታ" : "2 Bedrooms"}</option>
                <option value="3">{isAmharic ? "3 መኝታ" : "3 Bedrooms"}</option>
                <option value="4">{isAmharic ? "4+ መኝታ" : "4+ Bedrooms"}</option>
              </select>
            </div>

            {/* Amenities Filter */}
            <div>
              <span className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-2">
                {isAmharic ? "ዋና ዋና አገልግሎቶች" : "Key Amenities"}
              </span>
              <div className="space-y-2">
                {AMENITIES_LIST.slice(0, 6).map((amenity) => (
                  <label
                    key={amenity.id}
                    className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="rounded border-stone-300 text-[#C59B38] focus:ring-[#C59B38]"
                    />
                    <span>{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Properties Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Bar Sort and Results Count */}
            <div className="bg-white px-5 py-3.5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <span className="text-sm font-semibold text-stone-700">
                {isAmharic ? (
                  <>
                    <strong className="text-[#0A1426]">{properties.length}</strong> የኪራይ ቤቶች ተገኝተዋል
                  </>
                ) : (
                  <>
                    Showing <strong className="text-[#0A1426]">{properties.length}</strong> rental properties
                  </>
                )}
              </span>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-stone-500 text-xs font-medium">
                  {isAmharic ? "ቅደም ተከተል፦" : "Sort by:"}
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0A1426] focus:outline-none cursor-pointer"
                >
                  <option value="newest">{isAmharic ? "አዳዲሶች" : "Newest Listed"}</option>
                  <option value="rent_asc">{isAmharic ? "ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ" : "Rent: Low to High"}</option>
                  <option value="rent_desc">{isAmharic ? "ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ" : "Rent: High to Low"}</option>
                </select>
              </div>
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden animate-pulse h-96"
                  >
                    <div className="bg-stone-200 h-48 w-full" />
                    <div className="p-5 space-y-3">
                      <div className="bg-stone-200 h-4 rounded w-24" />
                      <div className="bg-stone-200 h-5 rounded w-3/4" />
                      <div className="bg-stone-200 h-4 rounded w-1/2" />
                      <div className="bg-stone-200 h-8 rounded w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center max-w-lg mx-auto my-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#0A1426] mb-1">
                  {isAmharic ? "ምንም የተገኘ የኪራይ ቤት የለም" : "No listings found"}
                </h3>
                <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                  {isAmharic
                    ? "በመረጡት መመዘኛ ወይም ቃል የተገኘ ቤት የለም። እባክዎ አካባቢውን ወይም ዋጋውን በመቀየር እንደገና ይሞክሩ።"
                    : "No properties currently match your selected filters. Try broadening your location, adjusting the monthly rent range, or clearing filters."}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="btn-navy px-6 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#DFB967]" />
                  <span>{isAmharic ? "ሁሉንም ማጣሪያዎች አጽዳ" : "Clear All Filters"}</span>
                </button>
              </div>
            ) : (
              /* Real Properties Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">Loading marketplace...</div>}>
      <PropertiesDirectoryContent />
    </Suspense>
  );
}
