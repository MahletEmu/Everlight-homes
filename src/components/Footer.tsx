"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Home, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  BROKER_PHONE,
  BROKER_PHONE_DISPLAY,
  BROKER_EMAIL,
  handlePhoneClick,
  handleEmailClick,
} from "@/lib/contactActions";

export default function Footer() {
  const { t, language } = useLanguage();
  const isAmharic = language === "am";
  const [phoneCopied, setPhoneCopied] = useState(false);

  const onPhoneCopied = () => {
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2500);
  };

  return (
    <footer className="bg-white border-t border-stone-200 pt-16 pb-12 text-stone-600 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-stone-100">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DFB967] to-[#C59B38] flex items-center justify-center text-[#0A1426] shadow-sm">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#0A1426] font-serif-luxury">
                  Everlight Homes
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-[#A97E29] uppercase">
                  {isAmharic ? "በባህር ዳር · የቤት ኪራይ" : "BAHIR DAR · RENTALS"}
                </span>
              </div>
            </Link>
            <p className="text-xs text-stone-500 leading-relaxed">
              {t.footer.aboutText}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-[#C59B38] transition-colors">
                  {isAmharic ? "ዋና ገጽ" : "Home"}
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#C59B38] transition-colors">
                  {isAmharic ? "የኪራይ ቤቶች" : "Browse Properties"}
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[#C59B38] transition-colors">
                  {isAmharic ? "ስለ እኛ" : "About Everlight"}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#C59B38] transition-colors">
                  {isAmharic ? "አገልግሎቶች" : "Leasing Services"}
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-[#C59B38] transition-colors">
                  {isAmharic ? "ያግኙን" : "Contact Advisory"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-4">
              {t.footer.contactUs}
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C59B38] shrink-0 mt-0.5" />
                <a
                  href={`tel:${BROKER_PHONE}`}
                  onClick={(e) => handlePhoneClick(e, onPhoneCopied)}
                  className="hover:underline font-medium text-stone-700 cursor-pointer"
                  title={isAmharic ? "ስልክ ለመደወል ወይም ኮፒ ለማድረግ" : "Call broker or copy phone number"}
                >
                  {BROKER_PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C59B38] shrink-0 mt-0.5" />
                <a
                  href={`mailto:${BROKER_EMAIL}?subject=${encodeURIComponent(
                    isAmharic ? "የባህር ዳር የቤት ኪራይ ጥያቄ" : "Everlight Homes Rental Inquiry"
                  )}`}
                  onClick={(e) =>
                    handleEmailClick(
                      e,
                      isAmharic ? "የባህር ዳር የቤት ኪራይ ጥያቄ" : "Everlight Homes Rental Inquiry"
                    )
                  }
                  className="hover:underline font-medium text-stone-700 cursor-pointer"
                  title={isAmharic ? "ኢሜይል ለመላክ ይጫኑ" : "Click to send email"}
                >
                  {BROKER_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>
            {isAmharic
              ? "© 2026 ኤቨርላይት ሆምስ ባህር ዳር። መብቱ በህግ የተጠበቀ ነው።"
              : "© 2026 Everlight Homes Bahir Dar. All rights reserved."}
          </p>
          <div className="flex gap-6">
            <Link href="/#privacy" className="hover:text-stone-600 transition-colors">
              {t.footer.privacy}
            </Link>
            <Link href="/#terms" className="hover:text-stone-600 transition-colors">
              {t.footer.terms}
            </Link>
            <Link href="/#commission" className="hover:text-stone-600 transition-colors">
              {t.footer.commissionPolicy}
            </Link>
          </div>
        </div>
      </div>

      {/* Copied Phone Number Toast */}
      {phoneCopied && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1426] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#DFB967] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="text-[#DFB967]">✓</span>
          <span>{isAmharic ? "ወደ ቅንጥብ ሰሌዳ ተገልብጧል" : "Copied to clipboard"}</span>
        </div>
      )}
    </footer>
  );
}
