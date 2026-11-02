"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, Eye, HelpCircle } from "lucide-react";
import { VerificationTier } from "@/types";
import { VERIFICATION_TIERS } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  tier?: VerificationTier;
  showExplanation?: boolean;
}

const TIER_LABELS_AM: Record<VerificationTier, { label: string; description: string }> = {
  unverified: {
    label: "ያልተረጋገጠ",
    description: "ያለ መታወቂያ ማረጋገጫ ወይም የአካል ፍተሻ የተመዘገበ ቤት።",
  },
  owner_verified: {
    label: "የባለቤት መታወቂያ የተረጋገጠ",
    description: "የአከራዩ መታወቂያ እና የባለቤትነት ሰነዶች በኤቨርላይት የተረጋገጡ።",
  },
  physically_inspected: {
    label: "በአካል ተጎብኝቶ የተረጋገጠ",
    description: "ቤቱ በኤቨርላይት ወኪሎች በአካል ተጎብኝቶ ፍተሻ የተደረገለት።",
  },
  fully_verified: {
    label: "ሙሉ በሙሉ የተረጋገጠ",
    description: "የባለቤትነት ሰነዶች እና የአካል ፍተሻ ሙሉ በሙሉ የተረጋገጠላቸው።",
  },
};

export default function VerificationBadge({ tier = "unverified", showExplanation = false }: Props) {
  const { language } = useLanguage();
  const isAmharic = language === "am";
  const config = VERIFICATION_TIERS[tier] || VERIFICATION_TIERS.unverified;
  const amConfig = TIER_LABELS_AM[tier] || TIER_LABELS_AM.unverified;

  const renderIcon = () => {
    switch (tier) {
      case "fully_verified":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case "owner_verified":
        return <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case "physically_inspected":
        return <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />;
    }
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.badgeClass}`}
      >
        {renderIcon()}
        <span>{isAmharic ? amConfig.label : config.label}</span>
      </span>
      {showExplanation && (
        <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
          {isAmharic ? amConfig.description : config.description}
        </p>
      )}
    </div>
  );
}
