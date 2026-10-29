"use client";

import React, { useState } from "react";
import { Globe, Check, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Floating Corner Language Switcher Widget
 * Placed visibly in the corner of the screen for maximum portability across all devices (mobile & desktop).
 * Allows any visitor to instantly toggle between Amharic (አማርኛ) and English (EN) with vibrant colors and clear choices.
 */
export default function FloatingLanguageWidget() {
  const { language, setLanguage } = useLanguage();
  const [minimized, setMinimized] = useState(false);

  const isAmharic = language === "am";

  return (
    <aside
      aria-label="Language selection corner widget"
      className="fixed bottom-5 right-5 z-50 flex items-center select-none"
    >
      <div className="relative group">
        {/* Glow backdrop effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#DFB967] via-[#C59B38] to-[#0A1426] rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-300 pointer-events-none" />

        <div className="relative bg-[#0A1426] text-white rounded-full p-1.5 border-2 border-[#DFB967] shadow-2xl flex items-center gap-1.5">
          {/* Globe & Status Indicator */}
          <button
            type="button"
            onClick={() => setMinimized(!minimized)}
            className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-bold text-[#DFB967] hover:text-white transition-colors"
            title={isAmharic ? "ቋንቋ ይምረጡ (አማርኛ / English)" : "Choose Language (English / Amharic)"}
            aria-label="Toggle language menu"
          >
            <Globe className="w-4 h-4 animate-spin-slow text-[#DFB967]" />
            <span className="hidden sm:inline text-[11px] font-extrabold uppercase tracking-wider text-stone-200">
              {isAmharic ? "ቋንቋ" : "Lang"}
            </span>
          </button>

          {/* Choice 1: English */}
          <button
            type="button"
            id="floating-lang-en"
            onClick={() => setLanguage("en")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 ${
              language === "en"
                ? "bg-[#DFB967] text-[#0A1426] shadow-md ring-2 ring-white/30 scale-105"
                : "text-stone-300 hover:text-white hover:bg-white/10"
            }`}
            aria-pressed={language === "en"}
            title="Switch website to English"
          >
            <span className="text-sm">🇬🇧</span>
            <span>English</span>
            {language === "en" && <Check className="w-3 h-3 stroke-[3]" />}
          </button>

          {/* Divider */}
          <span className="text-stone-600 text-xs">|</span>

          {/* Choice 2: Amharic (አማርኛ) */}
          <button
            type="button"
            id="floating-lang-am"
            onClick={() => setLanguage("am")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 ${
              language === "am"
                ? "bg-gradient-to-r from-[#C59B38] to-[#DFB967] text-[#0A1426] shadow-md ring-2 ring-white/40 scale-105 font-bold"
                : "text-stone-300 hover:text-white hover:bg-white/10"
            }`}
            aria-pressed={language === "am"}
            title="ድህረ ገጹን ወደ አማርኛ ቀይር"
          >
            <span className="text-sm">🇪🇹</span>
            <span>አማርኛ</span>
            {language === "am" && <Sparkles className="w-3 h-3 fill-current text-[#0A1426]" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
