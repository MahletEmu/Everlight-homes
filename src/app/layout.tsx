import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Everlight Homes Bahir Dar | Verified Rental Properties & Brokerage",
  description:
    "Exclusively serving Bahir Dar, Ethiopia. Discover verified rental homes, lakeside villas, modern apartments, and commercial spaces across Lake Tana Shore, Belay Zeleke, and Diaspora Village.",
  keywords: [
    "Bahir Dar house rent",
    "የባህር ዳር የቤት ኪራይ",
    "Bahir Dar delala",
    "Everlight Homes Bahir Dar",
    "Lake Tana villa rent",
    "Bahir Dar apartment rental",
    "Belay Zeleke condo rent",
    "Bahir Dar rental marketplace",
  ],
  openGraph: {
    title: "Everlight Homes Bahir Dar | Verified Rental Brokerage",
    description: "Verified rental properties in Bahir Dar. Find your rental home with Everlight.",
    type: "website",
    locale: "en_ET",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF9F6] text-[#0A1426] selection:bg-[#C59B38]/20 selection:text-[#0A1426]">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
