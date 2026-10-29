import React from "react";
import { ShieldCheck, CheckCircle2, Eye, HelpCircle } from "lucide-react";
import { VerificationTier } from "@/types";
import { VERIFICATION_TIERS } from "@/lib/constants";

interface Props {
  tier?: VerificationTier;
  showExplanation?: boolean;
}

export default function VerificationBadge({ tier = "unverified", showExplanation = false }: Props) {
  const config = VERIFICATION_TIERS[tier] || VERIFICATION_TIERS.unverified;

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
        <span>{config.label}</span>
      </span>
      {showExplanation && (
        <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
          {config.description}
        </p>
      )}
    </div>
  );
}
