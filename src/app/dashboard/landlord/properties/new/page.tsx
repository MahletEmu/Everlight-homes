"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BAHIR_DAR_NEIGHBORHOODS, PROPERTY_TYPES, AMENITIES_LIST } from "@/lib/constants";
import { IPropertyImage } from "@/types";

function NewPropertyContent() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState<string>("apartment");
  const [monthlyRent, setMonthlyRent] = useState<number>(35000);
  const [deposit, setDeposit] = useState<number>(35000);
  const [city, setCity] = useState<string>("Bahir Dar");
  const [neighborhood, setNeighborhood] = useState<string>(BAHIR_DAR_NEIGHBORHOODS[0]);
  const [addressDetails, setAddressDetails] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [sizeM2, setSizeM2] = useState<number>(110);
  const [amenities, setAmenities] = useState<string[]>([
    "backup_generator",
    "water_tank",
    "security",
  ]);

  // Images State
  const [images, setImages] = useState<IPropertyImage[]>([
    {
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      isPrimary: true,
      caption: "Living & Exterior View",
    },
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      setImages((prev) => [
        ...prev,
        {
          url: data.url,
          publicId: data.publicId,
          isPrimary: prev.length === 0,
        },
      ]);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;

    setImages((prev) => [
      ...prev,
      {
        url: imageUrlInput.trim(),
        isPrimary: prev.length === 0,
      },
    ]);
    setImageUrlInput("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const setPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError("Please add at least one property photograph.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          propertyType,
          monthlyRent,
          deposit,
          city,
          neighborhood,
          addressDetails,
          bedrooms,
          bathrooms,
          sizeM2,
          amenities,
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create listing");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/landlord");
      }, 2000);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message || "Failed to publish listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Back Link */}
        <Link
          href="/dashboard/landlord"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#0A1426] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landlord Dashboard</span>
        </Link>

        {/* Title Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C59B38] block mb-1">
            NEW LISTING WORKFLOW
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A1426] tracking-tight">
            Add a New Rental Property
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Provide accurate property specifications. Listings are reviewed by Everlight moderators prior to public indexing.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A1426]">
              Listing Submitted for Review!
            </h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Your property has been registered in the system. An Everlight moderator will review the details and initiate identity/inspection verifications.
            </p>
            <p className="text-xs text-[#A97E29] font-medium">
              Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Overview & Category */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-[#0A1426] border-b border-stone-100 pb-3">
                1. Basic Information & Classification
              </h3>

              <div>
                <label htmlFor="prop-title" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                  Listing Title
                </label>
                <input
                  id="prop-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern 3-Bedroom Executive Villa with Backup Generator in Old Airport"
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prop-category" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                    Property Category
                  </label>
                  <select
                    id="prop-category"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none"
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                    City (Bahir Dar Only / ባህር ዳር)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="Bahir Dar (ባህር ዳር)"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 text-stone-700 cursor-default select-none focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prop-neighborhood" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                    Bahir Dar Kebele / Area (ቀበሌ / አካባቢ)
                  </label>
                  <select
                    id="prop-neighborhood"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none"
                  >
                    {BAHIR_DAR_NEIGHBORHOODS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="prop-address" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                    Specific Address Details (Private to confirmed tenants)
                  </label>
                  <input
                    id="prop-address"
                    type="text"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    placeholder="e.g. Near Lake Tana Shore, House No. 104"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prop-description" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  id="prop-description"
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the home interior, finishing, neighborhood advantages, security, and compound..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
                />
              </div>
            </div>

            {/* Section 2: Pricing & Specs */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-[#0A1426] border-b border-stone-100 pb-3">
                2. Financials & Physical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prop-rent" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                    Monthly Rent (ETB)
                  </label>
                  <input
                    id="prop-rent"
                    type="number"
                    required
                    min={500}
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="prop-deposit" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                    Security Deposit (ETB)
                  </label>
                  <input
                    id="prop-deposit"
                    type="number"
                    min={0}
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="prop-bedrooms" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                    Bedrooms
                  </label>
                  <input
                    id="prop-bedrooms"
                    type="number"
                    required
                    min={0}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="prop-bathrooms" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                    Bathrooms
                  </label>
                  <input
                    id="prop-bathrooms"
                    type="number"
                    required
                    min={1}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="prop-size" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                    Area (m²)
                  </label>
                  <input
                    id="prop-size"
                    type="number"
                    required
                    min={10}
                    value={sizeM2}
                    onChange={(e) => setSizeM2(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <span className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-2">
                  Amenities Included
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITIES_LIST.map((amenity) => (
                    <label
                      key={amenity.id}
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all text-xs font-medium ${
                        amenities.includes(amenity.id)
                          ? "border-[#C59B38] bg-[#FAF3E1] text-[#0A1426]"
                          : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={amenities.includes(amenity.id)}
                        onChange={() => toggleAmenity(amenity.id)}
                        className="rounded border-stone-300 text-[#C59B38] focus:ring-[#C59B38]"
                      />
                      <span>{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Photography Upload */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-[#0A1426] border-b border-stone-100 pb-3">
                3. High-Resolution Photographs
              </h3>

              {/* Image Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 group bg-stone-100"
                  >
                    <Image
                      src={img.url}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                    />

                    {/* Primary Badge */}
                    {img.isPrimary ? (
                      <span className="absolute top-2 left-2 bg-[#C59B38] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                        Primary Photo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white text-[9px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm transition-all"
                      >
                        Set Primary
                      </button>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      aria-label="Remove image"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="border-2 border-dashed border-stone-300 hover:border-[#C59B38] p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-[#FAF3E1]/20">
                  <Upload className="w-6 h-6 text-[#A97E29] mb-1.5" />
                  <span className="text-xs font-bold text-[#0A1426]">
                    {uploadingImage ? "Uploading file..." : "Upload from Device"}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    JPG, PNG, WEBP (Max 6MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingImage}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="border border-stone-200 p-5 rounded-2xl bg-stone-50/50 flex flex-col justify-between">
                  <label htmlFor="image-url-input" className="text-xs font-bold text-[#0A1426] mb-1 block">
                    Or Add Image via Public URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="image-url-input"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="btn-navy px-3 py-2 rounded-xl text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gold py-4 rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                <span>{submitting ? "Publishing Listing..." : "Submit Listing for Moderation"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function NewPropertyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">Loading property editor...</div>}>
      <NewPropertyContent />
    </Suspense>
  );
}
