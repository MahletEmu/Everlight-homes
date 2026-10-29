"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, User, Mail, Lock, Phone, ArrowRight, AlertCircle, Building, Key } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [role, setRole] = useState<"tenant" | "landlord">("tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register account");
      }

      if (redirect && redirect !== "/") {
        router.push(redirect);
      } else if (role === "landlord") {
        router.push("/dashboard/landlord");
      } else {
        router.push("/dashboard/tenant");
      }
      router.refresh();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DFB967] to-[#C59B38] flex items-center justify-center text-[#0A1426] shadow-md shadow-[#C59B38]/20">
            <Home className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold tracking-tight text-[#0A1426] font-serif-luxury block">
              Everlight Homes
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-[#A97E29] uppercase block">
              ETHIOPIA · RENTALS
            </span>
          </div>
        </Link>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A1426] tracking-tight">
          Create Your Account
        </h2>
        <p className="mt-2 text-xs text-stone-500">
          Join Ethiopia&apos;s verified rental marketplace as a tenant or property owner.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-stone-200">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <span className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-2">
                I am registering as:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("tenant")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                    role === "tenant"
                      ? "border-[#0A1426] bg-[#0A1426] text-white shadow-sm"
                      : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <Key className={`w-5 h-5 ${role === "tenant" ? "text-[#DFB967]" : "text-stone-500"}`} />
                  <span>Tenant (Find a Home)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("landlord")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                    role === "landlord"
                      ? "border-[#0A1426] bg-[#0A1426] text-white shadow-sm"
                      : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <Building className={`w-5 h-5 ${role === "landlord" ? "text-[#DFB967]" : "text-stone-500"}`} />
                  <span>Landlord (List Property)</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Phone Number (Ethiopia)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Must be at least 8 characters with at least one uppercase letter and one number.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-navy py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
              >
                <span>{loading ? "Creating Profile..." : "Register Account"}</span>
                <ArrowRight className="w-4 h-4 text-[#DFB967]" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-stone-500">
            Already have an account?{" "}
            <Link
              href={`/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="font-bold text-[#0A1426] hover:text-[#C59B38] underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
