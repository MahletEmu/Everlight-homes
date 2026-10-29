"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{ id: string }>;
}

function EditPropertyContent({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [city, setCity] = useState("Bahir Dar");
  const [neighborhood, setNeighborhood] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [sizeM2, setSizeM2] = useState(50);
  const [amenities, setAmenities] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (!res.ok) throw new Error("Property not found or unauthorized");
        const data = await res.json();
        const p = data.property;

        setTitle(p.title);
        setDescription(p.description);
        setMonthlyRent(p.monthlyRent);
        setDeposit(p.deposit || 0);
        setCity(p.city);
        setNeighborhood(p.neighborhood);
        setAvailabilityStatus(p.availabilityStatus || "available");
        setBedrooms(p.bedrooms);
        setBathrooms(p.bathrooms);
        setSizeM2(p.sizeM2);
        setAmenities(p.amenities || []);
      } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError((err as any)?.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          monthlyRent,
          deposit,
          city,
          neighborhood,
          availabilityStatus,
          bedrooms,
          bathrooms,
          sizeM2,
          amenities,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update property");

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/landlord");
      }, 1500);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        Loading property...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Link
          href="/dashboard/landlord"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#0A1426] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landlord Portal</span>
        </Link>

        <h1 className="text-3xl font-extrabold text-[#0A1426] tracking-tight mb-2">
          Edit Property Listing
        </h1>
        <p className="text-xs text-stone-500 mb-8">
          Update pricing, availability, and description for your listed residence.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4 shadow-xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-bold text-[#0A1426]">Listing Updated!</h2>
            <p className="text-xs text-stone-500">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
            <div>
              <label htmlFor="edit-title" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Listing Title
              </label>
              <input
                id="edit-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-status" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                  Availability Status
                </label>
                <select
                  id="edit-status"
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none"
                >
                  <option value="available">Available for Rent</option>
                  <option value="rented">Mark as Rented</option>
                  <option value="withdrawn">Withdrawn from Market</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-rent" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                  Monthly Rent (ETB)
                </label>
                <input
                  id="edit-rent"
                  type="number"
                  required
                  min={500}
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                id="edit-description"
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="btn-navy py-3 px-8 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60"
              >
                <Save className="w-4 h-4 text-[#DFB967]" />
                <span>{saving ? "Saving Changes..." : "Save Property Changes"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function EditPropertyPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">Loading editor...</div>}>
      <EditPropertyContent {...props} />
    </Suspense>
  );
}
