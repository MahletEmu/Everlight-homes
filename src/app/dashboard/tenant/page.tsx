"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { IFavorite, IRentalInquiry, IRentalAgreement, IReportDispute } from "@/types";

function TenantDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "saved";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [favorites, setFavorites] = useState<IFavorite[]>([]);
  const [inquiries, setInquiries] = useState<IRentalInquiry[]>([]);
  const [agreements, setAgreements] = useState<IRentalAgreement[]>([]);
  const [disputes, setDisputes] = useState<IReportDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [favRes, inqRes, agrRes, disRes] = await Promise.all([
          fetch("/api/favorites"),
          fetch("/api/inquiries"),
          fetch("/api/agreements"),
          fetch("/api/disputes"),
        ]);

        if (!active) return;

        if (favRes.status === 401) {
          router.push("/auth/login?redirect=/dashboard/tenant");
          return;
        }

        if (favRes.ok) {
          const d = await favRes.json();
          if (active) setFavorites(d.favorites || []);
        }
        if (inqRes.ok) {
          const d = await inqRes.json();
          if (active) setInquiries(d.inquiries || []);
        }
        if (agrRes.ok) {
          const d = await agrRes.json();
          if (active) setAgreements(d.agreements || []);
        }
        if (disRes.ok) {
          const d = await disRes.json();
          if (active) setDisputes(d.disputes || []);
        }
      } catch (err) {
        console.error("Error loading tenant dashboard:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [router, refreshTrigger]);

  const handleConfirmAgreement = async (agreementId: string) => {
    try {
      const res = await fetch(`/api/agreements/${agreementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm agreement");

      setActionMessage("Rental agreement confirmed successfully!");
      setTimeout(() => setActionMessage(""), 4000);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((err as any)?.message || "Confirmation failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#0A1426] text-white py-10 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DFB967] block mb-1">
            TENANT PORTAL
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            My Resident Dashboard
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Manage your saved properties, viewing inquiries, and verified rental agreements.
          </p>
        </div>
      </div>

      {/* Action Banner */}
      {actionMessage && (
        <div className="bg-emerald-600 text-white text-center py-2.5 px-4 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 gap-4 sm:gap-8 overflow-x-auto mb-8">
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
              activeTab === "saved"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Bookmark className="w-4 h-4 text-[#C59B38]" />
            <span>Saved Properties ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
              activeTab === "inquiries"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C59B38]" />
            <span>Inquiries & Viewings ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("agreements")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
              activeTab === "agreements"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Rental Agreements ({agreements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
              activeTab === "disputes"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>My Reports ({disputes.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center text-sm text-stone-500 animate-pulse">
            Loading tenant records...
          </div>
        ) : (
          <div>
            {/* SAVED PROPERTIES TAB */}
            {activeTab === "saved" && (
              <div>
                {favorites.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center max-w-md mx-auto">
                    <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0A1426]">
                      No saved properties yet
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 mb-6">
                      Saved properties will appear here when added.
                    </p>
                    <Link
                      href="/properties"
                      className="btn-navy rounded-full px-5 py-2.5 text-xs font-semibold"
                    >
                      Browse Properties
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const prop = fav.propertyId as any;
                      if (!prop || !prop._id) return null;
                      return (
                        <PropertyCard
                          key={fav._id}
                          property={prop}
                          isFavorited={true}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* INQUIRIES TAB */}
            {activeTab === "inquiries" && (
              <div className="space-y-4">
                {inquiries.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center max-w-md mx-auto">
                    <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0A1426]">
                      No inquiries submitted
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 mb-6">
                      When you contact landlords on property pages, your viewing requests will appear here.
                    </p>
                    <Link
                      href="/properties"
                      className="btn-navy rounded-full px-5 py-2.5 text-xs font-semibold"
                    >
                      Find a Home to Inquire
                    </Link>
                  </div>
                ) : (
                  inquiries.map((inq) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const prop = inq.propertyId as any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const landlord = inq.landlordId as any;
                    return (
                      <div
                        key={inq._id}
                        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                inq.status === "accepted" || inq.status === "viewing_scheduled"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : inq.status === "declined"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {inq.status.replace("_", " ")}
                            </span>
                            <span className="text-xs text-stone-400">
                              Submitted {new Date(inq.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-[#0A1426]">
                            {prop?.title || "Property Listing"}
                          </h4>
                          {landlord?.name && (
                            <p className="text-xs text-stone-500">
                              Landlord: <strong>{landlord.name}</strong>
                            </p>
                          )}

                          <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                            &quot;{inq.message}&quot;
                          </p>

                          {inq.requestedViewingDate && (
                            <p className="text-xs text-[#A97E29] flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                Requested Viewing:{" "}
                                {new Date(inq.requestedViewingDate).toLocaleDateString()}
                              </span>
                            </p>
                          )}

                          {inq.landlordNote && (
                            <p className="text-xs text-stone-700 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/50">
                              <strong>Landlord note:</strong> {inq.landlordNote}
                            </p>
                          )}
                        </div>

                        <div className="flex md:flex-col gap-2 shrink-0">
                          {prop?._id && (
                            <Link
                              href={`/properties/${prop._id}`}
                              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 justify-center"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Listing</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* AGREEMENTS TAB */}
            {activeTab === "agreements" && (
              <div className="space-y-4">
                {agreements.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center max-w-md mx-auto">
                    <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0A1426]">
                      No active rental agreements
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Agreed leases and completed bookings will be managed here with full lease records.
                    </p>
                  </div>
                ) : (
                  agreements.map((agr) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const prop = agr.propertyId as any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const landlord = agr.landlordId as any;

                    return (
                      <div
                        key={agr._id}
                        className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                          <div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                agr.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : agr.status === "cancelled"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              Agreement: {agr.status.replace("_", " ")}
                            </span>
                            <h3 className="text-lg font-bold text-[#0A1426] mt-1">
                              {prop?.title || "Residential Property"}
                            </h3>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-stone-500 block">Agreed Monthly Rent</span>
                            <span className="text-lg font-extrabold text-[#0A1426]">
                              ETB {agr.agreedRent?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-100">
                          <div>
                            <span className="text-stone-400 block mb-0.5">Start Date</span>
                            <span className="font-semibold text-stone-800">
                              {new Date(agr.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block mb-0.5">Lease Duration</span>
                            <span className="font-semibold text-stone-800">
                              {agr.durationMonths} Months
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block mb-0.5">Security Deposit</span>
                            <span className="font-semibold text-stone-800">
                              ETB {agr.deposit?.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block mb-0.5">Landlord</span>
                            <span className="font-semibold text-stone-800">
                              {landlord?.name || "Verified Landlord"}
                            </span>
                          </div>
                        </div>

                        {/* Confirmation Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              {agr.landlordConfirmed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-500" />
                              )}
                              <span>Landlord Confirmed</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {agr.tenantConfirmed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-500" />
                              )}
                              <span>Tenant Confirmed</span>
                            </div>
                          </div>

                          {!agr.tenantConfirmed && agr.status !== "cancelled" && (
                            <button
                              onClick={() => handleConfirmAgreement(agr._id)}
                              className="btn-gold px-5 py-2 rounded-xl text-xs font-semibold shadow-sm"
                            >
                              Confirm Rental Agreement
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* DISPUTES TAB */}
            {activeTab === "disputes" && (
              <div className="space-y-4">
                {disputes.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center max-w-md mx-auto">
                    <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0A1426]">
                      No active reports
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      You haven&apos;t filed any disputes or reports. All platform communications remain protected.
                    </p>
                  </div>
                ) : (
                  disputes.map((disp) => (
                    <div
                      key={disp._id}
                      className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            disp.status === "resolved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Status: {disp.status}
                        </span>
                        <span className="text-xs text-stone-400">
                          {new Date(disp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#0A1426]">{disp.reason}</h4>
                      <p className="text-xs text-stone-600">{disp.description}</p>
                      {disp.resolutionNotes && (
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 mt-2">
                          <strong>Admin Resolution:</strong> {disp.resolutionNotes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function TenantDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">Loading dashboard...</div>}>
      <TenantDashboardContent />
    </Suspense>
  );
}
