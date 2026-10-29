"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VerificationBadge from "@/components/VerificationBadge";
import {
  IProperty,
  IVerificationRecord,
  ICommissionRecord,
  IReportDispute,
  IAuditLog,
} from "@/types";

interface AdminStats {
  totalProperties: number;
  pendingProperties: number;
  approvedProperties: number;
  totalUsers: number;
  totalAgreements: number;
  completedAgreements: number;
  pendingCommissions: number;
  paidCommissionsCount: number;
  totalRevenueETB: number;
  openDisputes: number;
  pendingVerifications: number;
}

function AdminDashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "moderation" | "verifications" | "commissions" | "disputes" | "audit_logs"
  >("overview");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [verifications, setVerifications] = useState<IVerificationRecord[]>([]);
  const [commissions, setCommissions] = useState<ICommissionRecord[]>([]);
  const [disputes, setDisputes] = useState<IReportDispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Reconcile Modal State
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<ICommissionRecord | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "telebirr_manual" | "cbe_birr" | "admin_reconciled">("bank_transfer");
  const [reconcileNotes, setReconcileNotes] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadAdminData() {
      try {
        const [statsRes, propRes, verRes, comRes, disRes, logRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/properties?adminView=true"),
          fetch("/api/verifications"),
          fetch("/api/commissions"),
          fetch("/api/disputes"),
          fetch("/api/admin/audit-logs"),
        ]);

        if (!active) return;

        if (statsRes.status === 403 || statsRes.status === 401) {
          router.push("/auth/login?redirect=/dashboard/admin");
          return;
        }

        if (statsRes.ok) {
          const d = await statsRes.json();
          if (active) setStats(d.stats);
        }
        if (propRes.ok) {
          const d = await propRes.json();
          if (active) setProperties(d.properties || []);
        }
        if (verRes.ok) {
          const d = await verRes.json();
          if (active) setVerifications(d.records || []);
        }
        if (comRes.ok) {
          const d = await comRes.json();
          if (active) setCommissions(d.commissions || []);
        }
        if (disRes.ok) {
          const d = await disRes.json();
          if (active) setDisputes(d.disputes || []);
        }
        if (logRes.ok) {
          const d = await logRes.json();
          if (active) setAuditLogs(d.logs || []);
        }
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAdminData();
    return () => {
      active = false;
    };
  }, [router, refreshTrigger]);

  const handleModerateProperty = async (
    propertyId: string,
    moderationStatus: "approved" | "rejected"
  ) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moderationStatus,
          rejectionReason:
            moderationStatus === "rejected"
              ? "Does not comply with Everlight listing quality standards or pricing rules."
              : "",
        }),
      });

      if (res.ok) {
        setActionMessage(`Property ${moderationStatus} successfully.`);
        setTimeout(() => setActionMessage(""), 4000);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error moderating property:", err);
    }
  };

  const handleUpdateVerification = async (
    recordId: string,
    ownerStatus: "verified" | "rejected",
    inspectionStatus: "inspected" | "scheduled" | "rejected" | "not_requested"
  ) => {
    try {
      const res = await fetch("/api/verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId,
          ownerVerificationStatus: ownerStatus,
          physicalInspectionStatus: inspectionStatus,
          inspectionDate: new Date().toISOString(),
          inspectorName: "Everlight Field Officer",
          notes: "Verification reviewed and completed in audit console.",
        }),
      });

      if (res.ok) {
        setActionMessage("Verification record updated!");
        setTimeout(() => setActionMessage(""), 4000);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error updating verification:", err);
    }
  };

  const handleReconcileCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommission) return;

    try {
      const res = await fetch(`/api/commissions/${selectedCommission._id}/reconcile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "paid",
          paymentReference: paymentRef,
          paymentMethod,
          reconciledNotes: reconcileNotes,
        }),
      });

      if (res.ok) {
        setReconcileModalOpen(false);
        setActionMessage("Commission reconciled and recorded as PAID.");
        setTimeout(() => setActionMessage(""), 4000);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error reconciling commission:", err);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    const notes = prompt("Enter resolution notes for this dispute:") || "Resolved by moderator.";
    try {
      const res = await fetch("/api/disputes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeId,
          status: "resolved",
          resolutionNotes: notes,
        }),
      });

      if (res.ok) {
        setActionMessage("Dispute marked as resolved.");
        setTimeout(() => setActionMessage(""), 4000);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error resolving dispute:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#0A1426] text-white py-10 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DFB967] block mb-1">
              CENTRAL ADMINISTRATION & MODERATION
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Everlight Operations Console
            </h1>
            <p className="text-xs text-stone-300 mt-1">
              Live moderation, dispute resolution, honest verification tiers, and auditable commission reconciliation.
            </p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-600 text-white text-center py-2.5 px-4 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 gap-4 sm:gap-6 overflow-x-auto mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            System Overview
          </button>

          <button
            onClick={() => setActiveTab("moderation")}
            className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "moderation"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <span>Property Moderation</span>
            {stats && stats.pendingProperties > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {stats.pendingProperties}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("verifications")}
            className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "verifications"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <span>Verification Queue</span>
          </button>

          <button
            onClick={() => setActiveTab("commissions")}
            className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "commissions"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <span>Commission Reconciliation</span>
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "disputes"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <span>Disputes & Reports</span>
            {stats && stats.openDisputes > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {stats.openDisputes}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("audit_logs")}
            className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === "audit_logs"
                ? "border-[#0A1426] text-[#0A1426]"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            Audit Logs
          </button>
        </div>

        {/* Tab Body */}
        {loading ? (
          <div className="py-20 text-center text-sm text-stone-500 animate-pulse">
            Loading administrative data...
          </div>
        ) : (
          <div>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && stats && (
              <div className="space-y-8">
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                    <span className="text-xs text-stone-400 block font-medium mb-1">
                      Total Listings
                    </span>
                    <div className="text-3xl font-extrabold text-[#0A1426]">
                      {stats.totalProperties}
                    </div>
                    <span className="text-[11px] text-emerald-600 mt-1 block">
                      {stats.approvedProperties} active & approved
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                    <span className="text-xs text-stone-400 block font-medium mb-1">
                      Pending Review
                    </span>
                    <div className="text-3xl font-extrabold text-amber-600">
                      {stats.pendingProperties}
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      Awaiting moderator check
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                    <span className="text-xs text-stone-400 block font-medium mb-1">
                      Reconciled Revenue
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#C59B38]">
                      ETB {stats.totalRevenueETB?.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      {stats.paidCommissionsCount} paid commissions
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                    <span className="text-xs text-stone-400 block font-medium mb-1">
                      Registered Accounts
                    </span>
                    <div className="text-3xl font-extrabold text-[#0A1426]">
                      {stats.totalUsers}
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      Tenants & Landlords
                    </span>
                  </div>
                </div>

                {/* Sub-grid of pending actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#0A1426]">
                        Quick Moderation Actions
                      </h3>
                      <button
                        onClick={() => setActiveTab("moderation")}
                        className="text-xs text-[#A97E29] font-semibold hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <p className="text-xs text-stone-500">
                      You have <strong>{stats.pendingProperties}</strong> property submissions requiring review before public publishing.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#0A1426]">
                        Active Inquiries & Agreements
                      </h3>
                      <button
                        onClick={() => setActiveTab("commissions")}
                        className="text-xs text-[#A97E29] font-semibold hover:underline"
                      >
                        Commissions
                      </button>
                    </div>

                    <p className="text-xs text-stone-500">
                      <strong>{stats.totalAgreements}</strong> agreements drafted,{" "}
                      <strong>{stats.completedAgreements}</strong> completed, and{" "}
                      <strong>{stats.pendingCommissions}</strong> pending commission reconciliation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MODERATION TAB */}
            {activeTab === "moderation" && (
              <div className="space-y-4">
                {properties.length === 0 ? (
                  <p className="text-xs text-stone-500">No properties in system.</p>
                ) : (
                  properties.map((prop) => (
                    <div
                      key={prop._id}
                      className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              prop.moderationStatus === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : prop.moderationStatus === "rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {prop.moderationStatus.replace("_", " ")}
                          </span>
                          <span className="text-xs text-stone-500">
                            {prop.city} · {prop.neighborhood}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-[#0A1426]">{prop.title}</h4>

                        <div className="text-xs text-stone-600 flex items-center gap-4">
                          <span>
                            Rent: <strong>ETB {prop.monthlyRent?.toLocaleString()}/mo</strong>
                          </span>
                          <span>{prop.bedrooms} Beds</span>
                          <span>{prop.bathrooms} Baths</span>
                          <span>{prop.sizeM2} m²</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/properties/${prop._id}`}
                          target="_blank"
                          className="px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                        >
                          Preview Listing
                        </Link>

                        {prop.moderationStatus !== "approved" && (
                          <button
                            onClick={() => handleModerateProperty(prop._id, "approved")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                          >
                            Approve
                          </button>
                        )}

                        {prop.moderationStatus !== "rejected" && (
                          <button
                            onClick={() => handleModerateProperty(prop._id, "rejected")}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VERIFICATIONS TAB */}
            {activeTab === "verifications" && (
              <div className="space-y-4">
                {verifications.length === 0 ? (
                  <p className="text-xs text-stone-500">No verification records in queue.</p>
                ) : (
                  verifications.map((ver) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const prop = ver.propertyId as any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const landlord = ver.landlordId as any;

                    return (
                      <div
                        key={ver._id}
                        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                          <div>
                            <h4 className="text-base font-bold text-[#0A1426]">
                              {prop?.title || "Property"}
                            </h4>
                            <p className="text-xs text-stone-500">
                              Owner: <strong>{landlord?.name}</strong> ({landlord?.email})
                            </p>
                          </div>

                          <div>
                            <VerificationBadge tier={prop?.verificationStatus} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl">
                          <div>
                            <span className="font-semibold block text-stone-800">
                              Owner ID Status:
                            </span>
                            <span className="capitalize text-stone-600">
                              {ver.ownerVerificationStatus}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold block text-stone-800">
                              Physical Inspection Status:
                            </span>
                            <span className="capitalize text-stone-600">
                              {ver.physicalInspectionStatus.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        {/* Verification Action Controls */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={() =>
                              handleUpdateVerification(ver._id, "verified", "not_requested")
                            }
                            className="px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs font-semibold hover:bg-blue-100"
                          >
                            Mark Owner ID Verified
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateVerification(ver._id, "verified", "inspected")
                            }
                            className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100"
                          >
                            Mark Fully Verified & Inspected
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateVerification(ver._id, "rejected", "rejected")
                            }
                            className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-semibold hover:bg-rose-100"
                          >
                            Reject Verification
                          </button>
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
                  <p className="text-xs text-stone-500">No commission obligations recorded.</p>
                ) : (
                  commissions.map((comm) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const prop = comm.propertyId as any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const payer = comm.payerId as any;

                    return (
                      <div
                        key={comm._id}
                        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3"
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
                              {comm.paymentStatus}
                            </span>
                            <h4 className="text-base font-bold text-[#0A1426] mt-1">
                              {prop?.title || "Property"}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-stone-500 block">Amount</span>
                            <span className="text-lg font-extrabold text-[#0A1426]">
                              ETB {comm.amountETB?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl space-y-1">
                          <p>
                            Payer: <strong>{payer?.name}</strong> ({payer?.email})
                          </p>
                          <p>Basis: {comm.commissionBasis}</p>
                          {comm.paymentReference && (
                            <p>
                              Tx Reference: <strong>{comm.paymentReference}</strong> (via{" "}
                              {comm.paymentMethod})
                            </p>
                          )}
                        </div>

                        {comm.paymentStatus === "pending" && (
                          <button
                            onClick={() => {
                              setSelectedCommission(comm);
                              setPaymentRef(`CBE-${Date.now().toString().slice(-6)}`);
                              setReconcileModalOpen(true);
                            }}
                            className="btn-gold px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
                          >
                            Reconcile Payment Received
                          </button>
                        )}
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
                  <p className="text-xs text-stone-500">No disputes reported.</p>
                ) : (
                  disputes.map((disp) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const reporter = disp.reportingUserId as any;
                    return (
                      <div
                        key={disp._id}
                        className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              disp.status === "resolved"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {disp.status}
                          </span>
                          <span className="text-xs text-stone-400">
                            {new Date(disp.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-[#0A1426]">
                          Reason: {disp.reason}
                        </h4>

                        <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl">
                          {disp.description}
                        </p>

                        <p className="text-xs text-stone-500">
                          Reported by: <strong>{reporter?.name}</strong> ({reporter?.email})
                        </p>

                        {disp.status === "open" && (
                          <button
                            onClick={() => handleResolveDispute(disp._id)}
                            className="btn-navy px-4 py-2 rounded-xl text-xs font-semibold"
                          >
                            Resolve Dispute & Add Notes
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === "audit_logs" && (
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Resource</th>
                      <th className="p-3.5">Admin</th>
                      <th className="p-3.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {auditLogs.map((log) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const admin = log.adminId as any;
                      return (
                        <tr key={log._id} className="hover:bg-stone-50/50">
                          <td className="p-3.5 font-bold text-[#0A1426]">{log.action}</td>
                          <td className="p-3.5 text-stone-600">
                            {log.resourceType}: {log.resourceId}
                          </td>
                          <td className="p-3.5 text-stone-800">{admin?.name || "Admin"}</td>
                          <td className="p-3.5 text-stone-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RECONCILE MODAL */}
      {reconcileModalOpen && selectedCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200">
            <h3 className="text-xl font-bold text-[#0A1426] mb-1">
              Reconcile Commission Payment
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Amount to verify:{" "}
              <strong>ETB {selectedCommission.amountETB?.toLocaleString()}</strong>
            </p>

            <form onSubmit={handleReconcileCommission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setPaymentMethod(e.target.value as any)
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                >
                  <option value="bank_transfer">CBE / Bank Transfer</option>
                  <option value="telebirr_manual">Telebirr Confirmation</option>
                  <option value="cbe_birr">CBE Birr</option>
                  <option value="admin_reconciled">Manual Official Receipt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1">
                  Bank / Telebirr Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. CBE-FT241027981"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1">
                  Reconciliation Notes
                </label>
                <textarea
                  rows={3}
                  value={reconcileNotes}
                  onChange={(e) => setReconcileNotes(e.target.value)}
                  placeholder="Confirm verified receipt via bank statement or Telebirr SMS..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReconcileModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2.5 rounded-xl text-xs font-semibold shadow-md"
                >
                  Confirm & Mark Paid
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">Loading admin portal...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
