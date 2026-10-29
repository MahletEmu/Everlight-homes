"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  propertyId: string;
  initialFavorited?: boolean;
  className?: string;
}

export default function FavoriteButton({
  propertyId,
  initialFavorited = false,
  className = "",
}: Props) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    const prev = isFavorited;
    setIsFavorited(!prev);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      if (res.status === 401) {
        setIsFavorited(prev);
        router.push(`/auth/login?redirect=/properties/${propertyId}`);
        return;
      }

      if (!res.ok) {
        setIsFavorited(prev);
      } else {
        const data = await res.json();
        setIsFavorited(data.isFavorite);
      }
    } catch {
      setIsFavorited(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={isFavorited ? "Remove from saved properties" : "Save property"}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/85 hover:bg-white backdrop-blur-md shadow-sm border border-black/5 active:scale-95 ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          isFavorited
            ? "fill-rose-500 text-rose-500"
            : "text-stone-600 hover:text-stone-900"
        }`}
      />
    </button>
  );
}
