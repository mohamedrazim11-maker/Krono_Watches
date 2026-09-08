"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Poster, Product } from "@/lib/api";
import SmoothImage from "@/components/SmoothImage";

interface HeroBannerProps {
  posters?: Poster[];
  products?: Product[];
  onCopyCoupon?: (code: string) => void;
}

const DEFAULT_FALLBACK_PRODUCTS = [
  {
    id: "prod-rolex-sub",
    name: "Rolex Submariner Date 41mm Cerachrom",
    price: 680000,
    category: "Sport",
    badge: "Iconic Diver",
    movement: "Rolex Perpetual Calibre 3235",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "prod-rolex-dj36",
    name: "Rolex Datejust 36 Fluted Bezel Jubilee",
    price: 540000,
    category: "Luxury",
    badge: "Classic Prestige",
    movement: "Rolex Calibre 3235 Automatic",
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "prod-omega-speedmaster",
    name: "Omega Speedmaster Professional Moonwatch",
    price: 490000,
    category: "Automatic",
    badge: "Space Heritage",
    movement: "Omega Co-Axial Master Chronometer 3861",
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "prod-tag-monaco",
    name: "TAG Heuer Monaco Calibre 11 Chronograph",
    price: 360000,
    category: "Sport",
    badge: "Racing Icon",
    movement: "Calibre 11 Automatic",
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85",
  },
];

export default function HeroBanner({
  posters = [],
  products = [],
}: HeroBannerProps) {
  const activePoster = posters.find((p) => p.is_active) || posters[0];
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Combine available products or fallback to default showcase items
  const showcaseItems =
    products.length > 0
      ? [
          ...products.filter((p) => p.is_featured),
          ...products.filter((p) => !p.is_featured),
        ].slice(0, 6)
      : (DEFAULT_FALLBACK_PRODUCTS as unknown as Product[]);

  const currentProduct =
    showcaseItems[activeProductIndex] || showcaseItems[0];

  // Auto rotate showcase items every 4 seconds when not hovered
  useEffect(() => {
    if (isPaused || showcaseItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveProductIndex((prev) => (prev + 1) % showcaseItems.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused, showcaseItems.length]);

  const handleNext = () => {
    setActiveProductIndex((prev) => (prev + 1) % showcaseItems.length);
  };

  const handlePrev = () => {
    setActiveProductIndex(
      (prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length
    );
  };

  const formatCurrency = (amount?: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131B2A] p-5 sm:p-7 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40 transition-colors duration-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center relative z-10">
        {/* Left Column: Narrative (50% Half Width) */}
        <div className="space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {currentProduct?.badge ||
                activePoster?.badge ||
                "Official 2026 Registry"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-[1.1] uppercase">
            Mastery in <br />
            <span className="text-slate-900 dark:text-white underline decoration-slate-300 dark:decoration-slate-700 decoration-2 underline-offset-8">
              Horology.
            </span>{" "}
            Crafted for Eternity.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed">
            Discover master-crafted Swiss mechanical wristwatches from Rolex,
            Omega, Patek Philippe, TAG Heuer, Cartier, and Tissot.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/catalog"
              className="lux-btn-primary px-6 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <span>Explore Vault</span>
              <span>→</span>
            </Link>

            <Link
              href="/about"
              className="lux-btn-secondary px-5 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-bold shadow-sm"
            >
              <span>Atelier Pedigree</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Dynamic Timepiece Showcase (50% Half Width) */}
        <div className="w-full relative flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-hidden group shadow-lg shadow-slate-200/50 dark:shadow-black/50">
            {/* Image Container with Smooth Transition */}
            <Link
              href={`/products/${currentProduct.id}`}
              className="block w-full h-full relative"
            >
              <SmoothImage
                key={currentProduct.id}
                src={
                  currentProduct.image_url ||
                  "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1000&q=85"
                }
                alt={currentProduct.name}
                className="w-full h-full object-cover object-center transition-all duration-[2000ms] ease-out group-hover:scale-105"
              />
            </Link>

            {/* Navigation Arrows */}
            {showcaseItems.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white flex items-center justify-center text-sm font-bold shadow-md hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer z-30 opacity-80 group-hover:opacity-100"
                  aria-label="Previous Timepiece"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white flex items-center justify-center text-sm font-bold shadow-md hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer z-30 opacity-80 group-hover:opacity-100"
                  aria-label="Next Timepiece"
                >
                  ›
                </button>
              </>
            )}

            {/* Dynamic Card Overlay */}
            <Link
              href={`/products/${currentProduct.id}`}
              className="absolute bottom-2.5 sm:bottom-3.5 inset-x-2.5 sm:inset-x-3.5 z-20 rounded-xl sm:rounded-2xl bg-white/95 dark:bg-[#0B0F17]/95 p-3 sm:p-3.5 border border-slate-200/90 dark:border-slate-800/90 backdrop-blur-md flex items-center justify-between shadow-xl hover:border-slate-400 dark:hover:border-slate-600 transition"
            >
              <div className="min-w-0 pr-2">
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <span>Featured Timepiece</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-700 dark:text-slate-300">{currentProduct.category}</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display truncate">
                  {currentProduct.name}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs sm:text-base font-black text-slate-900 dark:text-white font-num">
                  {formatCurrency(currentProduct.price)}
                </div>
                <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                  COSC Certified
                </div>
              </div>
            </Link>
          </div>

          {/* Bullet Indicators */}
          {showcaseItems.length > 1 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {showcaseItems.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => setActiveProductIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeProductIndex === idx
                      ? "w-6 bg-slate-900 dark:bg-white"
                      : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
