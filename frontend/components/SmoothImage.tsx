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
  "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1000&q=85";

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
    setCurrentSrc(src || fallbackSrc);
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
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900/80 ${containerClassName}`}>
      {/* Shimmer Placeholder Skeleton */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-[length:200%_100%] animate-shimmer transition-opacity duration-700 pointer-events-none ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Actual Image with Silk-Smooth Unblur & Fade Transition */}
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
        className={`w-full h-full ${fitClass} transform-gpu transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          loaded
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-md scale-95"
        } ${className}`}
      />
    </div>
  );
}
