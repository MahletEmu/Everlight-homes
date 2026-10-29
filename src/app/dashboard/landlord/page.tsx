"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Calendar,
  FileText,
  BadgePercent,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VerificationBadge from "@/components/VerificationBadge";
import { IProperty, IRentalInquiry, IRentalAgreement, ICommissionRecord } from "@/types";

function LandlordDashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"properties" | "inquiries" | "agreements" | "commissions">("properties");

  const [properties, setProperties] = useState<IProperty[]>([]);
  const [inquiries, setInquiries] = useState<IRentalInquiry[]>([]);
  const [agreements, setAgreements] = useState<IRentalAgreement[]>([]);
  const [commissions, setCommissions] = useState<ICommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Draft Agreement Modal State
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<IRentalInquiry | null>(null);
  const [agreedRent, setAgreedRent] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState(12);
  const [drafting, setDrafting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [propRes, inqRes, agrRes, comRes] = await Promise.all([
          fetch("/api/properties?mine=true"),
          fetch("/api/inquiries"),
          fetch("/api/agreements"),
          fetch("/api/commissions"),
        ]);

        if (!active) return;

        if (propRes.status === 403 || propRes.status === 401) {
          router.push("/auth/login?redirect=/dashboard/landlord");
          return;
        }

        if (propRes.ok) {
          const d = await propRes.json();
          if (active) setProperties(d.properties || []);
        }
        if (inqRes.ok) {
          const d = await inqRes.json();
          if (active) setInquiries(d.inquiries || []);
        }
        if (agrRes.ok) {
          const d = await agrRes.json();
          if (active) setAgreements(d.agreements || []);
        }
        if (comRes.ok) {
          const d = await comRes.json();
          if (active) setCommissions(d.commissions || []);
        }
      } catch (err) {
        console.error("Error loading landlord dashboard:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [router, refreshTrigger]);

  const handleUpdateInquiryStatus = async (
    inquiryId: string,
    status: "accepted" | "declined" | "viewing_scheduled"
  ) => {
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error updating inquiry:", err);
    }
  };

  const openDraftAgreementModal = (inquiry: IRentalInquiry) => {
    setSelectedInquiry(inquiry);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prop = inquiry.propertyId as any;
    setAgreedRent(prop?.monthlyRent || 0);
    setDeposit(prop?.monthlyRent || 0);
    setStartDate(new Date().toISOString().split("T")[0]);
    setDraftModalOpen(true);
  };

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setDrafting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const propId = (selectedInquiry.propertyId as any)?._id || selectedInquiry.propertyId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tenantId = (selectedInquiry.tenantId as any)?._id || selectedInquiry.tenantId;

      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: propId,
          tenantId: tenantId,
          agreedRent,
          deposit,
          startDate,
          durationMonths,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to draft agreement");

      setDraftModalOpen(false);
      setFeedbackMessage("Rental agreement drafted and sent to tenant for confirmation!");
      setTimeout(() => setFeedbackMessage(""), 5000);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((err as any)?.message || "Failed to create agreement");
    } finally {
      setDrafting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#0A1426] text-white py-10 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DFB967] block mb-1">
              LANDLORD & PROPERTY MANAGER
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Landlord Management Center
            </h1>
            <p className="text-xs text-stone-300 mt-1">
              Manage your residential listings, inspect tenant inquiries, and oversee commissions.
            </p>
          </div>

          <Link
            href="/dashboard/landlord/properties/new"
            className="btn-gold rounded-full px-5 py-3 text-xs font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </Link>
        </div>
      </div>

      {feedbackMessage && (
        <div className="bg-emerald-600 text-white text-center py-2.5 px-4 text-xs font-semibold">
          {feedbackMessage}
        </div>
      )}

      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Tabs */}
        <div className="flex border-b border-stone-200 gap-4 sm:gap-8 overflow-x-auto mb-8">
          <button
            onClick={() => setActiveTab("properties")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
              activeTab === "properties"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Building2 className="w-4 h-4 text-[#C59B38]" />
            <span>My Properties ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
              activeTab === "inquiries"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Tenant Inquiries ({inquiries.length})</span>
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
            <span>Agreements ({agreements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("commissions")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
              activeTab === "commissions"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <BadgePercent className="w-4 h-4 text-[#C59B38]" />
            <span>Commissions ({commissions.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center text-sm text-stone-500 animate-pulse">
            Loading landlord records...
          </div>
        ) : (
          <div>
            {/* PROPERTIES TAB */}
            {activeTab === "properties" && (
              <div>
                {properties.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center max-w-md mx-auto">
                    <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0A1426]">
                      No properties listed yet
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 mb-6">
                      Publish your residential houses, apartments, or rooms to reach verified tenants across Ethiopia.
                    </p>
                    <Link
                      href="/dashboard/landlord/properties/new"
                      className="btn-navy rounded-full px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-[#DFB967]" />
                      <span>Add First Listing</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => {
                      const primaryImg =
                        property.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                      return (
                        <div
                          key={property._id}
                          className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative aspect-[16/10] w-full bg-stone-100">
                              <Image
                                src={primaryImg}
                                alt={property.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover"
                              />
                              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                    property.moderationStatus === "approved"
                                      ? "bg-emerald-600 text-white"
                                      : property.moderationStatus === "rejected"
                                      ? "bg-rose-600 text-white"
                                      : "bg-amber-500 text-white"
                                  }`}
                                >
                                  {property.moderationStatus.replace("_", " ")}
                                </span>

                                <span className="bg-[#0A1426]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                  {property.availabilityStatus}
                                </span>
                              </div>
                            </div>

                            <div className="p-5 space-y-2">
                              <VerificationBadge tier={property.verificationStatus} />
                              <h3 className="font-bold text-base text-[#0A1426] line-clamp-1">
                                {property.title}
                              </h3>
                              <p className="text-xs text-stone-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{property.neighborhood}, {property.city}</span>
                              </p>

                              <div className="text-base font-extrabold text-[#0A1426] pt-1">
                                ETB {property.monthlyRent?.toLocaleString()}{" "}
                                <span className="text-xs font-normal text-stone-500">/mo</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                            <Link
                              href={`/properties/${property._id}`}
                              className="text-xs font-semibold text-stone-700 hover:text-[#0A1426] flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Listing</span>
                            </Link>

                            <Link
                              href={`/dashboard/landlord/properties/${property._id}/edit`}
                              className="text-xs font-semibold text-[#A97E29] hover:underline flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </Link>
                          </div>
                        </div>
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
                      No inquiries received yet
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Prospective tenants viewing your published properties will send inquiries here.
                    </p>
                  </div>
                ) : (
                  inquiries.map((inq) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const prop = inq.propertyId as any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const tenant = inq.tenantId as any;

                    return (
                      <div
                        key={inq._id}
                        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                          <div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                inq.status === "accepted" || inq.status === "viewing_scheduled"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : inq.status === "declined"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Inquiry: {inq.status.replace("_", " ")}
                            </span>
                            <h4 className="text-base font-bold text-[#0A1426] mt-1">
                              {prop?.title || "Property"}
                            </h4>
                          </div>

                          <div className="text-xs text-stone-500">
                            From: <strong className="text-stone-800">{tenant?.name}</strong>{" "}
                            ({tenant?.email} / {tenant?.phone || "No phone provided"})
                          </div>
                        </div>

                        <p className="text-xs text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                          &quot;{inq.message}&quot;
                        </p>

                        {inq.requestedViewingDate && (
                          <div className="text-xs text-[#A97E29] flex items-center gap-1.5 font-medium">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Requested In-Person Viewing:{" "}
                              {new Date(inq.requestedViewingDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          {inq.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateInquiryStatus(inq._id, "viewing_scheduled")
                                }
                                className="btn-gold px-4 py-2 rounded-xl text-xs font-semibold"
                              >
                                Schedule In-Person Viewing
                              </button>
                              <button
                                onClick={() => handleUpdateInquiryStatus(inq._id, "accepted")}
                                className="btn-navy px-4 py-2 rounded-xl text-xs font-semibold"
                              >
                                Accept Inquiry
                              </button>
                              <button
                                onClick={() => handleUpdateInquiryStatus(inq._id, "declined")}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {/* Initiate Agreement Proposal Button */}
                          <button
                            onClick={() => openDraftAgreementModal(inq)}
                            className="ml-auto btn-gold px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Draft Rental Agreement Proposal</span>
                          </button>
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
                      No rental agreements drafted
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      When you agree with a tenant on terms, draft the agreement to initiate mutual platform confirmation.
                    </p>
                  </div>
                ) : (
                  agreements.map((agr) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const prop = agr.propertyId as any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const tenant = agr.tenantId as any;

                    return (
                      <div
                        key={agr._id}
                        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4"
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
                              Status: {agr.status.replace("_", " ")}
                            </span>
                            <h3 className="text-lg font-bold text-[#0A1426] mt-1">
                              {prop?.title || "Property"}
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
                            <span className="text-stone-400 block mb-0.5">Tenant</span>
                            <span className="font-semibold text-stone-800">
                              {tenant?.name || "Tenant"}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block mb-0.5">Start Date</span>
                            <span className="font-semibold text-stone-800">
                              {new Date(agr.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block mb-0.5">Duration</span>
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
                        </div>

                        <div className="flex items-center gap-6 text-xs pt-1">
                          <div className="flex items-center gap-1.5">
                            {agr.landlordConfirmed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                            <span>Landlord Confirmation Recorded</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {agr.tenantConfirmed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                            <span>
                              {agr.tenantConfirmed
                                ? "Tenant Confirmed"
                                : "Awaiting Tenant Confirmation"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* COMMISSIONS TAB */}
            {activeTab === "commissions" && (
              <div className="space-y-4">
                {commissions.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center max-w-md mx-auto">
                    <BadgePercent className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0A1426]">
                      No commission obligations
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Commissions only generate upon successful completion of a mutually confirmed rental agreement.
                    </p>
                  </div>
                ) : (
                  commissions.map((comm) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const prop = comm.propertyId as any;

                    return (
                      <div
                        key={comm._id}
                        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                          <div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                comm.paymentStatus === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Payment Status: {comm.paymentStatus}
                            </span>
                            <h4 className="text-base font-bold text-[#0A1426] mt-1">
                              {prop?.title || "Property"}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-stone-500 block">Brokerage Fee</span>
                            <span className="text-xl font-extrabold text-[#0A1426]">
                              ETB {comm.amountETB?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-stone-600 bg-[#FAF3E1]/60 p-4 rounded-xl border border-[#DFB967]/30 space-y-1">
                          <p>
                            <strong>Basis:</strong> {comm.commissionBasis}
                          </p>
                          <p>
                            <strong>Due Date:</strong>{" "}
                            {new Date(comm.dueDate).toLocaleDateString()}
                          </p>
                          {comm.paymentReference && (
                            <p>
                              <strong>Transaction Reference:</strong> {comm.paymentReference}
                            </p>
                          )}
                        </div>

                        {comm.paymentStatus === "pending" && (
                          <div className="text-xs text-stone-500">
                            To reconcile your commission payment, please transfer to Everlight Homes Commercial Bank of Ethiopia (CBE) Account <strong>100023456789</strong> or Telebirr <strong>0911234567</strong>, and provide the transaction reference to administration.
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DRAFT AGREEMENT MODAL */}
      {draftModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200">
            <h3 className="text-xl font-bold text-[#0A1426] mb-1">
              Draft Rental Agreement Proposal
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Specify agreed terms for{" "}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <strong>{(selectedInquiry.tenantId as any)?.name}</strong>.
            </p>

            <form onSubmit={handleCreateAgreement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1">
                  Agreed Monthly Rent (ETB)
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  value={agreedRent}
                  onChange={(e) => setAgreedRent(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1">
                  Security Deposit (ETB)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDraftModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={drafting}
                  className="flex-1 btn-gold py-2.5 rounded-xl text-xs font-semibold shadow-md"
                >
                  {drafting ? "Creating Proposal..." : "Submit Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function LandlordDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">Loading landlord portal...</div>}>
      <LandlordDashboardContent />
    </Suspense>
  );
}
