"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Home, Banknote, Search, X } from "lucide-react";
import { BAHIR_DAR_NEIGHBORHOODS, PROPERTY_TYPES } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function HeroSearch() {
  const router = useRouter();
  const { language } = useLanguage();
  const [q, setQ] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const isAmharic = language === "am";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("city", "Bahir Dar");
    if (q.trim()) params.set("q", q.trim());
    if (neighborhood && neighborhood !== "all") params.set("neighborhood", neighborhood);
    if (propertyType && propertyType !== "all") params.set("propertyType", propertyType);
    if (budget && budget !== "all") params.set("maxRent", budget);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="glass-panel rounded-3xl p-4 md:p-5 shadow-2xl max-w-4xl mx-auto w-full border-2 border-white/80 bg-white/95 backdrop-blur-xl"
    >
      {/* Primary Keyword Search Bar */}
      <div className="relative mb-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-stone-50 border-2 border-stone-200 focus-within:border-[#C59B38] focus-within:bg-white transition-all shadow-inner">
          <Search className="w-5 h-5 text-[#C59B38] shrink-0" />
          <input
            id="hero-search-input"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              isAmharic
                ? "የሚፈልጉትን ቤት፣ ቀበሌ ወይም አይነት እዚህ ይፃፉ (ለምሳሌ፡ ቪላ፣ ጣና ሐይቅ፣ አፓርታማ)..."
                : "Search rentals by keyword, villa, apartment, or kebele (e.g. Lake Tana, Diaspora)..."
            }
            className="w-full bg-transparent text-sm md:text-base font-medium text-[#0A1426] placeholder:text-stone-400 focus:outline-none"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="p-1 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
        {/* Location Dropdown */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-50/80 hover:bg-white border border-stone-200 transition-all">
          <MapPin className="w-4 h-4 text-[#C59B38] shrink-0" />
          <div className="flex-1 text-left min-w-0">
            <label htmlFor="search-location" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider truncate">
              {isAmharic ? "ቀበሌ / አካባቢ" : "Location"}
            </label>
            <select
              id="search-location"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#0A1426] focus:outline-none cursor-pointer truncate"
            >
              <option value="all">{isAmharic ? "መላው ባህር ዳር (ሁሉም)" : "All Bahir Dar Areas"}</option>
              {BAHIR_DAR_NEIGHBORHOODS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Property Type Dropdown */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-50/80 hover:bg-white border border-stone-200 transition-all">
          <Home className="w-4 h-4 text-[#C59B38] shrink-0" />
          <div className="flex-1 text-left min-w-0">
            <label htmlFor="search-type" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider truncate">
              {isAmharic ? "የቤት አይነት" : "Property Type"}
            </label>
            <select
              id="search-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#0A1426] focus:outline-none cursor-pointer truncate"
            >
              <option value="all">{isAmharic ? "ሁሉም አይነቶች" : "Any Category"}</option>
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget Dropdown */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-50/80 hover:bg-white border border-stone-200 transition-all">
          <Banknote className="w-4 h-4 text-[#C59B38] shrink-0" />
          <div className="flex-1 text-left min-w-0">
            <label htmlFor="search-budget" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider truncate">
              {isAmharic ? "ከፍተኛ ዋጋ (ብር)" : "Max Budget (ETB)"}
            </label>
            <select
              id="search-budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#0A1426] focus:outline-none cursor-pointer truncate"
            >
              <option value="all">{isAmharic ? "ማንኛውም ዋጋ" : "Any Budget"}</option>
              <option value="5000">{isAmharic ? "እስከ 5,000 ብር" : "Up to 5,000 ETB"}</option>
              <option value="10000">{isAmharic ? "እስከ 10,000 ብር" : "Up to 10,000 ETB"}</option>
              <option value="15000">{isAmharic ? "እስከ 15,000 ብር" : "Up to 15,000 ETB"}</option>
              <option value="20000">{isAmharic ? "እስከ 20,000 ብር" : "Up to 20,000 ETB"}</option>
            </select>
          </div>
        </div>

        {/* Search Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full h-[46px] rounded-xl bg-[#0A1426] hover:bg-[#132446] text-[#DFB967] hover:text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-98"
          >
            <Search className="w-4 h-4 text-[#DFB967]" />
            <span>{isAmharic ? "ቤቶችን ፈልግ" : "Search Rentals"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
