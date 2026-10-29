"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Send, CheckCircle2 } from "lucide-react";

interface Props {
  targetType: "property" | "landlord" | "tenant" | "agreement" | "commission";
  targetId: string;
  targetTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DisputeModal({
  targetType,
  targetId,
  targetTitle,
  isOpen,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit dispute");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1800);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message || "Failed to submit report");
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
            <h3 className="text-xl font-bold text-[#0A1426]">Report Submitted</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Everlight administrators have received your report and will investigate promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                SUBMIT REPORT / DISPUTE
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0A1426]">
              {targetTitle ? `Report: ${targetTitle}` : "Submit an Official Report"}
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="dispute-reason" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Primary Reason
              </label>
              <select
                id="dispute-reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
              >
                <option value="">Select a reason...</option>
                <option value="Inaccurate listing information">Inaccurate listing information</option>
                <option value="Suspected fraudulent ownership">Suspected fraudulent ownership</option>
                <option value="Off-platform fee extortion">Off-platform fee extortion</option>
                <option value="Agreement breach">Agreement terms breach</option>
                <option value="Commission policy violation">Commission policy violation</option>
                <option value="Other grievance">Other grievance</option>
              </select>
            </div>

            <div>
              <label htmlFor="dispute-description" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Detailed Explanation
              </label>
              <textarea
                id="dispute-description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened in detail, including dates or specific communications..."
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "Submitting..." : "Submit to Moderation Team"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
