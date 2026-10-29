"use client";

import React, { useState } from "react";
import { Calendar, AlertTriangle, ShieldCheck, Phone, Mail } from "lucide-react";
import InquiryModal from "@/components/InquiryModal";
import DisputeModal from "@/components/DisputeModal";
import { IProperty, IUser, IVerificationRecord } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  BROKER_PHONE,
  BROKER_PHONE_DISPLAY,
  BROKER_EMAIL,
  handlePhoneClick,
  handleEmailClick,
} from "@/lib/contactActions";

interface Props {
  property: IProperty;
  landlord: IUser | null;
  verification?: IVerificationRecord | null;
}

export default function PropertyDetailInteractive({ property, landlord }: Props) {
  const { language } = useLanguage();
  const isAmharic = language === "am";
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const onPhoneCopied = () => {
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2500);
  };

  return (
    <div className="sticky top-28 space-y-6">
      {/* Action Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xl space-y-5">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Rental Rate
          </span>
          <div className="text-3xl font-extrabold text-[#0A1426] mt-1">
            ETB {property.monthlyRent?.toLocaleString()}{" "}
            <span className="text-sm font-normal text-stone-500">/month</span>
          </div>
          {property.deposit > 0 && (
            <p className="text-xs text-stone-500 mt-1">
              Refundable Security Deposit: ETB {property.deposit.toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-2.5 pt-2">
          {property.availabilityStatus === "available" ? (
            <>
              {/* Direct Call to Broker */}
              <a
                href={`tel:${BROKER_PHONE}`}
                onClick={(e) => handlePhoneClick(e, onPhoneCopied)}
                className="w-full btn-gold py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                title={isAmharic ? "ስልክ ለመደወል ወይም ኮፒ ለማድረግ" : "Call broker or copy phone number"}
              >
                <Phone className="w-4 h-4 text-[#0A1426]" />
                <span>
                  {isAmharic
                    ? `ደላላውን ይደውሉ (${BROKER_PHONE_DISPLAY})`
                    : `Call Broker (${BROKER_PHONE_DISPLAY})`}
                </span>
              </a>

              <button
                onClick={() => setInquiryOpen(true)}
                className="w-full btn-navy py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Calendar className="w-4 h-4 text-[#DFB967]" />
                <span>Request In-Person Viewing</span>
              </button>
            </>
          ) : (
            <button
              disabled
              className="w-full bg-stone-200 text-stone-500 py-3.5 rounded-xl text-sm font-semibold cursor-not-allowed"
            >
              Property Rented / Unavailable
            </button>
          )}

          <button
            onClick={() => setDisputeOpen(true)}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-rose-600 hover:bg-rose-50/50 flex items-center justify-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-stone-400" />
            <span>Report suspicious listing or incorrect info</span>
          </button>
        </div>

        {/* Broker Information Card */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF3E1] text-[#A97E29] flex items-center justify-center font-bold text-base border border-[#DFB967]/30">
              BD
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#0A1426]">
                  Bahir Dar Rental Broker (ደላላ)
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs text-stone-500 block">
                Direct Brokerage & Viewing Coordinator
              </span>
              {landlord?.name && (
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Property Owner: {landlord.name}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a
              href={`tel:${BROKER_PHONE}`}
              onClick={(e) => handlePhoneClick(e, onPhoneCopied)}
              className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 hover:border-[#DFB967] flex items-center gap-2 text-stone-700 transition-colors cursor-pointer"
              title={isAmharic ? "ስልክ ለመደወል ወይም ኮፒ ለማድረግ" : "Call broker or copy phone number"}
            >
              <Phone className="w-3.5 h-3.5 text-[#C59B38] shrink-0" />
              <span className="font-semibold">{BROKER_PHONE_DISPLAY}</span>
            </a>
            <a
              href={`mailto:${BROKER_EMAIL}?subject=${encodeURIComponent(
                isAmharic ? `የቤት ኪራይ ጥያቄ: ${property.title}` : `Inquiry for: ${property.title}`
              )}`}
              onClick={(e) =>
                handleEmailClick(
                  e,
                  isAmharic
                    ? `የባህር ዳር የቤት ኪራይ ጥያቄ: ${property.title} (ID: ${property._id})`
                    : `Everlight Homes Inquiry: ${property.title} (ID: ${property._id})`
                )
              }
              className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 hover:border-[#DFB967] flex items-center gap-2 text-stone-700 truncate transition-colors cursor-pointer"
              title={isAmharic ? "ኢሜይል ለመላክ ይጫኑ" : "Click to send email"}
            >
              <Mail className="w-3.5 h-3.5 text-[#C59B38] shrink-0" />
              <span className="truncate">{BROKER_EMAIL}</span>
            </a>
          </div>
        </div>

        {/* Safety & Tenant Commission Policy Disclaimer */}
        <div className="bg-[#FAF3E1]/70 p-4 rounded-xl border border-[#DFB967]/40 text-[11px] text-stone-700 space-y-1.5 leading-relaxed">
          <p className="font-bold text-[#886121]">Tenant Brokerage Fee (የደላላ ኮሚሽን)፦</p>
          <p>
            ይህን ቤት መርጠው ለመከራየት ሲፈልጉ ደላላውን በቀጥታ በስልክ ያነጋግሩ። የደላላው ኮሚሽን የሚከፈለው ቤቱን በአካል አይተውና ወድደው የኪራይ ስምምነት ሲጨርሱ ከተከራዩ ጋር በሚደረግ ግልጽ ስምምነት ነው።
          </p>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        propertyId={property._id}
        propertyTitle={property.title}
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />

      {/* Dispute Modal */}
      <DisputeModal
        targetType="property"
        targetId={property._id}
        targetTitle={property.title}
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
      />

      {/* Copied Phone Number Toast */}
      {phoneCopied && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1426] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#DFB967] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="text-[#DFB967]">✓</span>
          <span>{isAmharic ? "ወደ ቅንጥብ ሰሌዳ ተገልብጧል" : "Copied to clipboard"}</span>
        </div>
      )}
    </div>
  );
}
