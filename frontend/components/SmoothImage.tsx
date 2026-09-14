"use client";

import { useState, useEffect, useRef } from "react";

interface SmoothImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85";

export default function SmoothImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  fallbackSrc = DEFAULT_FALLBACK,
  loading = "lazy",
  objectFit = "cover",
}: SmoothImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const targetSrc = src && src.trim() !== "" ? src : fallbackSrc;
    setCurrentSrc(targetSrc);
    // Check if the image is already cached and loaded by browser
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src, fallbackSrc]);

  const fitClass =
    objectFit === "contain"
      ? "object-contain"
      : objectFit === "fill"
      ? "object-fill"
      : objectFit === "scale-down"
      ? "object-scale-down"
      : "object-cover";

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#FAF8F5] dark:bg-[#080B10] flex items-center justify-center ${containerClassName}`}
    >
      {/* Shimmer Placeholder Skeleton */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#F3EFEA] to-[#FAF8F5] dark:from-[#080B10] dark:via-[#141D2E] dark:to-[#080B10] bg-[length:200%_100%] animate-shimmer transition-opacity duration-500 pointer-events-none ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Actual Image with Silk-Smooth Transition */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          }
          setLoaded(true);
        }}
        className={`w-full h-full ${fitClass} object-center transform-gpu transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          loaded
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-sm scale-[0.98]"
        } ${className}`}
      />
    </div>
  );
}
