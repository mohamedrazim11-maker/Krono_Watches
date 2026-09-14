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
  onCopyCoupon,
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

  // Auto rotate showcase items every 4.5 seconds when not hovered
  useEffect(() => {
    if (isPaused || showcaseItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveProductIndex((prev) => (prev + 1) % showcaseItems.length);
    }, 4500);
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
      className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] bg-gradient-to-br from-white via-[#F8FAF9] to-[#F1F5F3] dark:from-[#0B1C15] dark:via-[#06110D] dark:to-[#030806] p-6 sm:p-8 lg:p-10 shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background Rolex green glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#006039]/10 dark:bg-[#00824E]/15 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#C5A059]/10 dark:bg-[#006039]/10 rounded-full blur-2xl pointer-events-none -z-0"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
        {/* Left Narrative Column */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#006039]/30 dark:border-[#00A362]/40 bg-[#E8F5EE] dark:bg-[#11261D] px-3.5 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#006039] dark:bg-[#4ADE80] animate-ping"></span>
            <span className="font-bold">
              {currentProduct?.badge ||
                activePoster?.badge ||
                "Geneva Horological Registry • 2026 Edition"}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-[1.08] uppercase">
              Perpetual <br />
              <span className="rolex-gradient-text">Mastery.</span> <br />
              Crafted for Eternity.
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] max-w-lg font-normal leading-relaxed">
              Discover certified Swiss luxury horology. Iconic references from Rolex, Omega, Patek Philippe, Audemars Piguet, and TAG Heuer engineered to supreme precision.
            </p>
          </div>

          {/* Special VIP Voucher Highlight if present */}
          {activePoster?.coupon_code && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAF9] dark:bg-[#11261D] border border-[#006039]/30 max-w-md shadow-sm">
              <div className="p-2 rounded-xl bg-[#006039]/15 text-[#006039] dark:text-[#4ADE80] text-lg font-bold">
                ✦
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-[#5A6D64] dark:text-[#8EAA9C] uppercase">
                  Collector Privilege Code
                </div>
                <div className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] font-mono tracking-wider">
                  {activePoster.coupon_code} ({activePoster.discount_text || "20% OFF"})
                </div>
              </div>
              {onCopyCoupon && (
                <button
                  onClick={() => onCopyCoupon(activePoster.coupon_code!)}
                  className="px-3 py-1.5 rounded-lg bg-[#006039] hover:bg-[#00482B] text-white text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer shadow-sm transition"
                >
                  Apply
                </button>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/catalog"
              className="lux-btn-primary px-7 py-3 rounded-xl text-xs uppercase tracking-[0.18em] font-extrabold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <span>Explore Vault</span>
              <span className="text-sm">→</span>
            </Link>

            <Link
              href="/about"
              className="lux-btn-secondary px-6 py-3 rounded-xl text-xs uppercase tracking-[0.18em] font-bold shadow-sm"
            >
              <span>Atelier Pedigree</span>
            </Link>
          </div>
        </div>

        {/* Right Timepiece Stage Showcase Column */}
        <div className="lg:col-span-6 w-full relative flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] bg-white dark:bg-[#06110D] overflow-hidden group shadow-2xl">
            {/* Main Product Image with Smooth Transition */}
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
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 dark:bg-[#0B1C15]/90 border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.4)] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center text-base font-bold shadow-lg hover:border-[#006039] hover:text-[#006039] transition cursor-pointer z-30 opacity-90 group-hover:opacity-100"
                  aria-label="Previous Timepiece"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 dark:bg-[#0B1C15]/90 border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.4)] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center text-base font-bold shadow-lg hover:border-[#006039] hover:text-[#006039] transition cursor-pointer z-30 opacity-90 group-hover:opacity-100"
                  aria-label="Next Timepiece"
                >
                  ›
                </button>
              </>
            )}

            {/* Dynamic Card Overlay */}
            <Link
              href={`/products/${currentProduct.id}`}
              className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 z-20 rounded-2xl bg-white/95 dark:bg-[#0B1C15]/95 p-3.5 sm:p-4 border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] backdrop-blur-xl flex items-center justify-between shadow-2xl hover:border-[#006039] transition-all"
            >
              <div className="min-w-0 pr-3">
                <div className="text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <span className="text-[#006039] dark:text-[#4ADE80]">Featured Reference</span>
                  <span>•</span>
                  <span>{currentProduct.category}</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-display truncate">
                  {currentProduct.name}
                </div>
                {currentProduct.movement && (
                  <div className="text-[10px] text-[#64748B] dark:text-[#8EAA9C] font-mono truncate">
                    {currentProduct.movement}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs sm:text-base font-black text-[#006039] dark:text-[#4ADE80] font-num">
                  {formatCurrency(currentProduct.price)}
                </div>
                <div className="text-[9px] text-[#006039] dark:text-[#10B981] font-mono font-bold flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006039] dark:bg-[#10B981]"></span> COSC Certified
                </div>
              </div>
            </Link>
          </div>

          {/* Bullet Indicators */}
          {showcaseItems.length > 1 && (
            <div className="flex items-center gap-2 mt-3.5">
              {showcaseItems.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => setActiveProductIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeProductIndex === idx
                      ? "w-8 bg-[#006039] dark:bg-[#00A362] shadow-sm"
                      : "w-2 bg-[#CBD5E1] dark:bg-[#1F4535] hover:bg-[#006039]"
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
