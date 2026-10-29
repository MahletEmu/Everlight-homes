"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n";

interface Props {
  className?: string;
  variant?: "pill" | "compact";
}

/**
 * Globe Language Selector Component matching reference:
 * 🌐 Eng ⌄ / 🌐 አማ ⌄
 */
export default function LanguageSwitcher({ className = "" }: Props) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const isAmharic = language === "am";

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button: 🌐 Eng ⌄ / 🌐 አማ ⌄ */}
      <button
        type="button"
        id="navbar-lang-dropdown-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-stone-800 text-sm font-semibold transition-colors focus:outline-none cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={isAmharic ? "ቋንቋ ይምረጡ / Choose Language" : "Choose Language / ቋንቋ ይምረጡ"}
      >
        <Globe className="w-4 h-4 text-stone-800 shrink-0" strokeWidth={1.8} />
        <span className="text-sm font-semibold tracking-tight text-stone-900">
          {isAmharic ? "አማ" : "Eng"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-stone-800" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Language selection"
          className="absolute right-0 mt-2 w-36 rounded-xl bg-white border border-stone-200 shadow-xl py-1 z-50 animate-in fade-in duration-150 focus:outline-none overflow-hidden"
        >
          {/* Option: English */}
          <button
            type="button"
            id="lang-option-en"
            role="option"
            aria-selected={language === "en"}
            onClick={() => selectLanguage("en")}
            className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
              language === "en"
                ? "bg-[#FAF3E1] text-[#0A1426] font-extrabold"
                : "text-stone-700 hover:bg-stone-50 hover:text-[#0A1426]"
            }`}
          >
            <span>English</span>
            {language === "en" && <Check className="w-3.5 h-3.5 text-[#C59B38] stroke-[2.5]" />}
          </button>

          {/* Option: Amharic */}
          <button
            type="button"
            id="lang-option-am"
            role="option"
            aria-selected={language === "am"}
            onClick={() => selectLanguage("am")}
            className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
              language === "am"
                ? "bg-[#FAF3E1] text-[#0A1426] font-extrabold"
                : "text-stone-700 hover:bg-stone-50 hover:text-[#0A1426]"
            }`}
          >
            <span>አማርኛ</span>
            {language === "am" && <Check className="w-3.5 h-3.5 text-[#C59B38] stroke-[2.5]" />}
          </button>
        </div>
      )}
    </div>
  );
}
