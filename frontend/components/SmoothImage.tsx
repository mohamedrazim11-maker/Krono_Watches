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

const DEFAULT_FALLBACK = "/images/watches/submariner_deep_black_ceramic.jpg";

export default function SmoothImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  fallbackSrc = DEFAULT_FALLBACK,
  loading = "eager",
  objectFit = "cover",
}: SmoothImageProps) {
  const [loaded, setLoaded] = useState(true); // Default to true for instant perception of cached/local images
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const targetSrc = src && src.trim() !== "" ? src : fallbackSrc;
    setCurrentSrc(targetSrc);

    // If the browser already has the image decoded/cached, show immediately
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
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
      className={`relative w-full h-full overflow-hidden bg-[#0A0A0A] flex items-center justify-center ${containerClassName}`}
    >
      {/* Background placeholder subtle shimmer if loading takes > 100ms */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#111] bg-[length:200%_100%] animate-pulse pointer-events-none"
        />
      )}

      {/* Actual Image with Instant High-Performance Display */}
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
        className={`w-full h-full ${fitClass} object-center transform-gpu transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-90"
        } ${className}`}
      />
    </div>
  );
}
