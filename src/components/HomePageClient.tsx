"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Home as HomeIcon,
  Headphones,
  Sparkles,
  ArrowRight,
  Search,
  CalendarCheck,
  FileText,
  BadgePercent,
  Phone,
  Mail,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSearch from "@/components/HeroSearch";
import PropertyCard from "@/components/PropertyCard";
import { IProperty } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  BROKER_PHONE,
  BROKER_PHONE_DISPLAY,
  BROKER_EMAIL,
  handlePhoneClick,
  handleEmailClick,
} from "@/lib/contactActions";

interface Props {
  featuredProperties: IProperty[];
}

export default function HomePageClient({ featuredProperties }: Props) {
  const { t, language } = useLanguage();
  const isAmharic = language === "am";
  const [phoneCopied, setPhoneCopied] = useState(false);

  const onPhoneCopied = () => {
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2500);
  };

  // Smooth scroll to anchor hash on initial load or navigation
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      {/* HERO SECTION matching Everlight Homes reference layout */}
      <section className="relative pt-6 pb-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading and Tagline */}
            <div className="lg:col-span-6 space-y-6 z-10">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#0A1426] bg-[#FAF3E1] border border-[#DFB967]/50 px-3.5 py-1.5 rounded-full shadow-sm">
                {t.hero.tag}
              </span>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A1426] tracking-tight leading-snug">
                {isAmharic ? (
                  <>
                    የሚከራይ ቤትዎን <br />
                    <span className="font-serif-luxury font-normal text-[#C59B38]">በቀላሉ ያግኙ</span>
                  </>
                ) : (
                  <>
                    Find Your <br />
                    <span className="font-serif-luxury font-normal text-[#C59B38]">Rental Home</span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                {t.hero.description}
              </p>

              {/* Direct Broker Contact Chip */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <a
                  href={`tel:${BROKER_PHONE}`}
                  onClick={(e) => handlePhoneClick(e, onPhoneCopied)}
                  className="inline-flex items-center gap-2 bg-[#0A1426] hover:bg-[#132446] text-[#DFB967] hover:text-white px-4 py-2 rounded-full font-bold shadow-md transition-all cursor-pointer"
                  title={isAmharic ? "ስልክ ለመደወል ወይም ኮፒ ለማድረግ" : "Call broker or copy phone number"}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{BROKER_PHONE_DISPLAY}</span>
                </a>
                <span className="text-stone-500 font-medium">
                  {isAmharic
                    ? "የባህር ዳር የቤት ደላላ · ቤት ሲመርጡ ያነጋግሩን"
                    : "Verified Bahir Dar Broker · Call upon selecting property"}
                </span>
              </div>
            </div>

            {/* Right Column: Reference Luxury Architectural Residence */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl border border-stone-200/60">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85"
                  alt="Modern luxury architectural home in Ethiopia with evening illumination"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Floating Search Bar */}
          <div className="mt-8 md:mt-12">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* TRUST PILLARS (4-Column Grid matching reference) */}
      <section className="py-12 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pillar 1 */}
            <div className="flex flex-col items-center text-center p-4 group">
              <div className="w-14 h-14 rounded-full bg-[#FAF3E1] flex items-center justify-center text-[#C59B38] mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <HomeIcon className="w-6 h-6 text-[#A97E29]" />
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-1">
                {t.pillars.verified}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                {t.pillars.verifiedDesc}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col items-center text-center p-4 group">
              <div className="w-14 h-14 rounded-full bg-[#FAF3E1] flex items-center justify-center text-[#C59B38] mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <ShieldCheck className="w-6 h-6 text-[#A97E29]" />
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-1">
                {t.pillars.security}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                {t.pillars.securityDesc}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col items-center text-center p-4 group">
              <div className="w-14 h-14 rounded-full bg-[#FAF3E1] flex items-center justify-center text-[#C59B38] mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Headphones className="w-6 h-6 text-[#A97E29]" />
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-1">
                {t.pillars.support}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                {t.pillars.supportDesc}
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="flex flex-col items-center text-center p-4 group">
              <div className="w-14 h-14 rounded-full bg-[#FAF3E1] flex items-center justify-center text-[#C59B38] mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Sparkles className="w-6 h-6 text-[#A97E29]" />
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-1">
                {t.pillars.living}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                {t.pillars.livingDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES SECTION */}
      <section className="py-20 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C59B38] block mb-2">
                {t.featured.tag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1426] tracking-tight">
                {t.featured.title}
              </h2>
            </div>
            <Link
              href="/properties"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#0A1426] hover:text-[#C59B38] transition-colors"
            >
              <span>{t.featured.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE EVERLIGHT SPLIT SHOWCASE */}
      <section id="about" className="py-20 bg-white border-t border-stone-200/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Image with Script Badge */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
                <Image
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80"
                  alt="Bright, warm, contemporary living room interior with plush cream sofa"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Luxury Glass Badge */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="inline-flex items-center gap-2 bg-[#0A1426]/90 backdrop-blur-md text-[#DFB967] border border-[#DFB967]/40 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#DFB967]" />
                    <span>{t.whyChoose.scriptBadge}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Why Choose Description & Verified Stats */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C59B38] block">
                {t.whyChoose.tag}
              </span>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0A1426] tracking-tight leading-snug">
                {t.whyChoose.title}
              </h2>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                {t.whyChoose.description}
              </p>

              {/* 4 Metrics Grid - Sleek Luxury Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-stone-100">
                <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-stone-200/80 hover:border-[#DFB967] transition-all flex flex-col justify-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-[#0A1426] tracking-tight">
                    {t.whyChoose.stat1Val}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1 leading-snug">
                    {t.whyChoose.stat1Label}
                  </div>
                </div>

                <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-stone-200/80 hover:border-[#DFB967] transition-all flex flex-col justify-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-[#0A1426] tracking-tight">
                    {t.whyChoose.stat2Val}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1 leading-snug">
                    {t.whyChoose.stat2Label}
                  </div>
                </div>

                <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-stone-200/80 hover:border-[#DFB967] transition-all flex flex-col justify-center">
                  <div className="text-sm sm:text-base font-extrabold text-[#0A1426] tracking-tight leading-snug">
                    {t.whyChoose.stat3Val}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1 leading-snug">
                    {t.whyChoose.stat3Label}
                  </div>
                </div>

                <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-stone-200/80 hover:border-[#DFB967] transition-all flex flex-col justify-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-[#0A1426] tracking-tight">
                    {t.whyChoose.stat4Val}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1 leading-snug">
                    {t.whyChoose.stat4Label}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (Rental & Tenant Brokerage Workflow) */}
      <section id="services" className="py-20 bg-[#FAF9F6] border-t border-stone-200/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C59B38] block mb-2">
              {isAmharic ? "ግልጽና ህጋዊ አሰራር" : "TRANSPARENT PROCESS"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1426] tracking-tight">
              {isAmharic ? "ኤቨርላይት እንዴት ይሰራል?" : "How Everlight Works"}
            </h2>
            <p className="text-sm text-stone-600 mt-3">
              {isAmharic
                ? "ተከራዮችን እና አከራዮችን በህጋዊና በአስተማማኝ ሁኔታ የሚያገናኝ የባህር ዳር የቤት ኪራይ ቅደም-ተከተል"
                : "A standardized, secure rental workflow designed to protect tenants and landlords at every milestone."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col hover:border-[#DFB967] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0A1426] text-[#DFB967] flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#C59B38]" />
                <span>{isAmharic ? "ፍለጋና ማጣሪያ" : "Search & Filter"}</span>
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {isAmharic
                  ? "በጣና ሐይቅ፣ ዲያስፖራ መንደር፣ በላይ ዘለቀ፣ አባይ ማዶ እና በሁሉም የባህር ዳር ቀበሌዎች የሚከራዩ ቤቶችን በኪራይ ዋጋ፣ በመኝታ ብዛት እና በአገልግሎቶች ይፈልጉ።"
                  : "Browse verified rental properties across Lake Tana, Diaspora Village, Belay Zeleke, and all Bahir Dar kebeles by monthly budget in ETB, bedrooms, and essential amenities."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col hover:border-[#DFB967] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0A1426] text-[#DFB967] flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-2 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#C59B38]" />
                <span>{isAmharic ? "ቤት መጎብኘት" : "Inquire & View"}</span>
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {isAmharic
                  ? "የሚፈልጉትን ቤት ከመረጡ በኋላ ደላላውን በቀጥታ በስልክ (+251 937 762 030) ወይም በመድረኩ በማነጋገር በአካል ተገኝተው ቤቱን ይጎብኙ።"
                  : "Contact the broker directly via phone (+251 937 762 030) or platform to schedule an in-person viewing and inspect property conditions."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col hover:border-[#DFB967] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0A1426] text-[#DFB967] flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C59B38]" />
                <span>{isAmharic ? "የኪራይ ውል ማረጋገጥ" : "Confirm Agreement"}</span>
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {isAmharic
                  ? "ተከራይ እና አከራይ በወር ኪራይ፣ በቅድመ ክፍያ እና በመግቢያ ቀን ላይ ከተስማሙ በኋላ ህጋዊና የተረጋገጠ የኪራይ ውል ይፈጽማሉ።"
                  : "Both landlord and tenant record the agreed rent, deposit, and move-in terms. The agreement requires mutual confirmation."}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col hover:border-[#DFB967] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0A1426] text-[#DFB967] flex items-center justify-center font-bold text-sm mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-2 flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-[#C59B38]" />
                <span>{isAmharic ? "የተከራይ ደላላ ኮሚሽን" : "Tenant Brokerage Fee"}</span>
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {isAmharic
                  ? "ተከራዩ ቤቱን ወዶ ከመረጠ እና የኪራይ ውሉ በይፋ ከተረጋገጠ በኋላ፣ ደላላው ከተከራዩ ጋር በተስማማው መሰረት የደላላነት ኮሚሽኑን ይቀበላል።"
                  : "When you find and choose a rental home you love, the broker requests the agreed brokerage fee from the prospective tenant upon mutual viewing confirmation and lease finalization."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CALL TO ACTION BANNER matching reference */}
      <section className="py-12 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#070D18] via-[#0A1426] to-[#132446] text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DFB967]">
                {t.cta.tag}
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                {t.cta.title}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                {t.cta.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/auth/register"
                  className="btn-gold rounded-full px-7 py-3.5 text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <span>{isAmharic ? "ይጀምሩ" : "Get Started"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/properties"
                  className="rounded-full px-7 py-3.5 text-sm font-semibold border border-white/30 hover:bg-white/10 transition-colors"
                >
                  {isAmharic ? "ቤቶችን ያስሱ" : "Explore Listings"}
                </Link>
              </div>
            </div>

            {/* Architectural decorative image on right of banner */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 lg:opacity-40 pointer-events-none hidden sm:block">
              <Image
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
                alt="City architecture silhouette"
                fill
                className="object-cover object-left"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT & BROKER ADVISORY SECTION */}
      <section id="contact" className="py-20 bg-white border-t border-stone-200/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C59B38] block mb-2">
              {isAmharic ? "ያግኙን · ፈጣን የደላላ ድጋፍ" : "GET IN TOUCH · DIRECT BROKER SUPPORT"}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A1426] tracking-tight">
              {isAmharic ? "የባህር ዳር የቤት ኪራይ አማካሪን ያነጋግሩ" : "Contact Our Bahir Dar Advisory"}
            </h2>
            <p className="text-sm text-stone-600 mt-3 leading-relaxed">
              {isAmharic
                ? "ስለ ኪራይ ቤቶች፣ ስለ አከራይነት ምዝገባ ወይም በአካል አይተው ለመከራየት ፈጣን የደላላ እገዛ በሚከተሉት አድራሻዎች ያግኙን።"
                : "For property viewings, verified landlord onboarding, or personalized rental advice across Bahir Dar, reach our team directly."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Phone Card */}
            <div className="bg-[#FAF9F6] p-7 rounded-2xl border border-stone-200 hover:border-[#DFB967] transition-all flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#0A1426] text-[#DFB967] flex items-center justify-center mb-4 shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-1">
                {isAmharic ? "በስልክ ይደውሉ" : "Call Directly"}
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                {isAmharic ? "ከሰኞ - ቅዳሜ ፡ 2፡30 ጠዋት - 12፡30 ምሽት" : "Mon - Sat: 8:30 AM - 6:30 PM"}
              </p>
              <a
                href={`tel:${BROKER_PHONE}`}
                onClick={(e) => handlePhoneClick(e, onPhoneCopied)}
                className="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-navy text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                title={isAmharic ? "ስልክ ለመደወል ወይም ኮፒ ለማድረግ" : "Call broker or copy phone number"}
              >
                <Phone className="w-3.5 h-3.5 text-[#DFB967]" />
                <span>{BROKER_PHONE_DISPLAY}</span>
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-[#FAF9F6] p-7 rounded-2xl border border-stone-200 hover:border-[#DFB967] transition-all flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#0A1426] text-[#DFB967] flex items-center justify-center mb-4 shadow-sm">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0A1426] mb-1">
                {isAmharic ? "ኢሜይል ይጻፉልን" : "Email Advisory"}
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                {isAmharic ? "ጥያቄዎን ወይም ማስታወቂያዎን በኢሜይል ይላኩ" : "Send inquiries or property details anytime"}
              </p>
              <a
                href={`mailto:${BROKER_EMAIL}?subject=${encodeURIComponent(isAmharic ? "የባህር ዳር የቤት ኪራይ ጥያቄ" : "Everlight Homes Rental Inquiry")}`}
                onClick={(e) => handleEmailClick(e, isAmharic ? "የባህር ዳር የቤት ኪራይ ጥያቄ" : "Everlight Homes Rental Inquiry")}
                className="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-stone-300 hover:border-[#DFB967] text-[#0A1426] text-xs font-bold shadow-sm transition-all truncate max-w-full cursor-pointer hover:shadow-md"
                title={isAmharic ? "ኢሜይል ለመላክ ይጫኑ" : "Click to send email"}
              >
                <Mail className="w-3.5 h-3.5 text-[#C59B38]" />
                <span className="truncate">{BROKER_EMAIL}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Copied Phone Number Toast */}
      {phoneCopied && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1426] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#DFB967] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="text-[#DFB967]">✓</span>
          <span>{isAmharic ? "ወደ ቅንጥብ ሰሌዳ ተገልብጧል" : "Copied to clipboard"}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
