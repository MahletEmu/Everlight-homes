"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      const role = data.user.role;
      if (redirect && redirect !== "/") {
        router.push(redirect);
      } else if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "landlord") {
        router.push("/dashboard/landlord");
      } else {
        router.push("/dashboard/tenant");
      }
      router.refresh();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message || "Invalid credentials");
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
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-xs text-stone-500">
          Access your saved homes, rental agreements, and landlord management tools.
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
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-[#0A1426] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C59B38]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-navy py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
              >
                <span>{loading ? "Verifying..." : "Sign In"}</span>
                <ArrowRight className="w-4 h-4 text-[#DFB967]" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-stone-500">
            Don&apos;t have an account yet?{" "}
            <Link
              href={`/auth/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="font-bold text-[#0A1426] hover:text-[#C59B38] underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
