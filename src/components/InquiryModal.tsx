"use client";

import React, { useState } from "react";
import { X, Calendar, Send, CheckCircle2 } from "lucide-react";

interface Props {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InquiryModal({
  propertyId,
  propertyTitle,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [message, setMessage] = useState(
    "Hello, I am interested in this rental property and would like to arrange an in-person viewing."
  );
  const [viewingDate, setViewingDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          message,
          requestedViewingDate: viewingDate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit rental inquiry");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
      }, 1800);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message || "Failed to submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#0A1426]">Inquiry Sent!</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              The landlord has received your viewing request and message. You can track this in your Tenant Dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B38] block mb-1">
                RENTAL INQUIRY & VIEWING
              </span>
              <h3 className="text-lg font-bold text-[#0A1426] line-clamp-1">
                {propertyTitle}
              </h3>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="inquiry-message" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Message to Landlord
              </label>
              <textarea
                id="inquiry-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and specify any questions regarding move-in date or utilities..."
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
              />
            </div>

            <div>
              <label htmlFor="viewing-date" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C59B38]" />
                <span>Preferred In-Person Viewing Date (Optional)</span>
              </label>
              <input
                id="viewing-date"
                type="date"
                value={viewingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setViewingDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-navy py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60"
              >
                <Send className="w-4 h-4 text-[#DFB967]" />
                <span>{loading ? "Sending Request..." : "Submit Inquiry"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
