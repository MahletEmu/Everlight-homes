"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, LogOut, Menu, X, ArrowRight, ShieldCheck, Building, Key, Search } from "lucide-react";
import { SessionPayload } from "@/lib/auth/jwt";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAmharic = language === "am";

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setUserDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getDashboardHref = () => {
    if (!user) return "/auth/login";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "landlord") return "/dashboard/landlord";
    return "/dashboard/tenant";
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `/#${hash}`);
      }
    }
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DFB967] to-[#C59B38] flex items-center justify-center text-white shadow-md shadow-[#C59B38]/20 group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5 text-[#0A1426]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#0A1426] font-serif-luxury">
              {isAmharic ? "ኤቨርላይት ሆምስ" : "Everlight Homes"}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#A97E29] uppercase">
              {isAmharic ? "ባህር ዳር · የቤት ኪራይ" : "BAHIR DAR · RENTALS"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/" ? "text-[#C59B38] font-bold" : "text-stone-600 hover:text-[#0A1426]"
            }`}
          >
            {t.nav.home}
          </Link>
          <Link
            href="/properties"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith("/properties")
                ? "text-[#C59B38] font-bold"
                : "text-stone-600 hover:text-[#0A1426]"
            }`}
          >
            {t.nav.properties}
          </Link>
          <Link
            href="/#about"
            onClick={(e) => handleAnchorClick(e, "about")}
            className="text-sm font-medium text-stone-600 hover:text-[#0A1426] transition-colors"
          >
            {t.nav.about}
          </Link>
          <Link
            href="/#services"
            onClick={(e) => handleAnchorClick(e, "services")}
            className="text-sm font-medium text-stone-600 hover:text-[#0A1426] transition-colors"
          >
            {t.nav.services}
          </Link>
          <Link
            href="/#contact"
            onClick={(e) => handleAnchorClick(e, "contact")}
            className="text-sm font-medium text-stone-600 hover:text-[#0A1426] transition-colors"
          >
            {t.nav.contact}
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Search Shortcut */}
          <Link
            href="/properties"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 hover:bg-white hover:border-[#DFB967] text-stone-700 hover:text-[#0A1426] transition-all text-xs font-bold shadow-sm"
            title={isAmharic ? "ቤቶችን ፈልግ" : "Search Properties"}
          >
            <Search className="w-3.5 h-3.5 text-[#C59B38]" />
            <span>{isAmharic ? "ፈልግ" : "Search"}</span>
          </Link>

          {/* Prominent Corner Language Switcher */}
          <LanguageSwitcher />

          {!loading && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-300 bg-stone-50 transition-all text-sm font-medium text-stone-800"
              >
                <div className="w-7 h-7 rounded-full bg-[#0A1426] text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs text-stone-500">Signed in as</p>
                    <p className="text-sm font-bold text-[#0A1426] truncate">{user.name}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF3E1] text-[#A97E29]">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href={getDashboardHref()}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    {user.role === "admin" ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ) : user.role === "landlord" ? (
                      <Building className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Key className="w-4 h-4 text-[#C59B38]" />
                    )}
                    <span>{user.role === "admin" ? "Admin Panel" : t.nav.dashboard}</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.nav.signOut}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-[#0A1426] hover:text-[#C59B38] px-3 py-2 transition-colors"
              >
                {t.nav.signIn}
              </Link>
              <Link
                href="/auth/register"
                className="btn-navy rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
              >
                <span>{t.nav.getStarted}</span>
                <ArrowRight className="w-4 h-4 text-[#DFB967]" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Corner Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Corner Language Toggle */}
          <LanguageSwitcher variant="compact" />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-600">ቋንቋ / Language</span>
            <LanguageSwitcher />
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
          >
            {t.nav.home}
          </Link>
          <Link
            href="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
          >
            {t.nav.properties}
          </Link>
          <Link
            href="/#about"
            onClick={(e) => handleAnchorClick(e, "about")}
            className="block px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
          >
            {t.nav.about}
          </Link>
          <Link
            href="/#services"
            onClick={(e) => handleAnchorClick(e, "services")}
            className="block px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
          >
            {t.nav.services}
          </Link>
          <Link
            href="/#contact"
            onClick={(e) => handleAnchorClick(e, "contact")}
            className="block px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
          >
            {t.nav.contact}
          </Link>

          <div className="pt-4 border-t border-stone-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn-navy rounded-xl py-3 text-center text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-[#DFB967]" />
                  <span>Open Dashboard ({user.role})</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 text-center text-sm text-rose-600 font-medium"
                >
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl border border-stone-200 text-[#0A1426]"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn-navy py-2.5 text-center text-sm font-semibold rounded-xl"
                >
                  {t.nav.getStarted}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
