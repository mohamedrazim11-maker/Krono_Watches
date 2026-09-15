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
    id: "prod-rolex-submariner",
    name: "Rolex Submariner Date 41mm Cerachrom",
    price: 3100000,
    category: "Dive Watches",
    badge: "Iconic Diver",
    movement: "Rolex Perpetual Calibre 3235",
    image_url: "/images/watches/submariner_deep_black_ceramic.jpg",
  },
  {
    id: "prod-omega-speedmaster-moonwatch",
    name: "Omega Speedmaster Professional Moonwatch",
    price: 2450000,
    category: "Chronograph",
    badge: "Space Certified",
    movement: "Omega Co-Axial Master Chronometer 3861",
    image_url: "/images/watches/speedmaster_chrono_titanium.jpg",
  },
  {
    id: "prod-grand-seiko-spring-drive-snowflake",
    name: "Grand Seiko Heritage Spring Drive 'Snowflake'",
    price: 2150000,
    category: "Automatic",
    badge: "Shinshu Snowflake",
    movement: "Grand Seiko Calibre 9R65 Spring Drive",
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "prod-tissot-prx-powermatic-80",
    name: "Tissot PRX Powermatic 80 Ice Blue",
    price: 245000,
    category: "Automatic",
    badge: "Integrated Bracelet",
    movement: "Swiss Powermatic 80",
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
      className="relative overflow-hidden rounded-[2rem] neu-raised-lg p-6 sm:p-8 lg:p-10 transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
        {/* Left Narrative Column */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full neu-raised-sm px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80]">
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
              Discover certified luxury horology. Curated references from Rolex, Omega, Casio, Seiko, and Tissot engineered to supreme mechanical and electronic precision.
            </p>
          </div>

          {/* Special VIP Voucher Highlight if present */}
          {activePoster?.coupon_code && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl neu-inset max-w-md">
              <div className="p-2.5 rounded-xl neu-raised-sm text-[#006039] dark:text-[#4ADE80] text-base font-bold">
                ✦
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-bold">
                  Collector Privilege Code
                </div>
                <div className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] font-mono tracking-wider">
                  {activePoster.coupon_code} ({activePoster.discount_text || "20% OFF"})
                </div>
              </div>
              {onCopyCoupon && (
                <button
                  onClick={() => onCopyCoupon(activePoster.coupon_code!)}
                  className="px-3.5 py-1.5 rounded-xl neu-btn-primary text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition"
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
              className="neu-btn-primary px-7 py-3 rounded-2xl text-xs uppercase tracking-[0.18em] font-extrabold flex items-center gap-2 transition-all"
            >
              <span>Explore Vault</span>
              <span className="text-sm">→</span>
            </Link>

            <Link
              href="/about"
              className="neu-btn px-6 py-3 rounded-2xl text-xs uppercase tracking-[0.18em] font-bold"
            >
              <span>Atelier Pedigree</span>
            </Link>
          </div>
        </div>

        {/* Right Timepiece Stage Showcase Column */}
        <div className="lg:col-span-6 w-full relative flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl neu-inset p-2 sm:p-2.5 overflow-hidden group">
            {/* Main Product Image */}
            <Link
              href={`/products/${currentProduct.id}`}
              className="block w-full h-full relative rounded-2xl overflow-hidden"
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-2xl neu-btn-icon text-[#0F172A] dark:text-[#F8FAFC] text-base font-bold transition cursor-pointer z-30 opacity-90 group-hover:opacity-100"
                  aria-label="Previous Timepiece"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-2xl neu-btn-icon text-[#0F172A] dark:text-[#F8FAFC] text-base font-bold transition cursor-pointer z-30 opacity-90 group-hover:opacity-100"
                  aria-label="Next Timepiece"
                >
                  ›
                </button>
              </>
            )}

            {/* Dynamic Card Overlay */}
            <Link
              href={`/products/${currentProduct.id}`}
              className="absolute bottom-4 inset-x-4 z-20 rounded-2xl neu-raised p-3.5 sm:p-4 backdrop-blur-md flex items-center justify-between hover:neu-raised-lg transition-all"
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
            <div className="flex items-center gap-2.5 mt-4 p-1 rounded-full neu-inset">
              {showcaseItems.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => setActiveProductIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeProductIndex === idx
                      ? "w-8 bg-[#006039] dark:bg-[#00A362] shadow-sm"
                      : "w-2 bg-[rgba(166,180,200,0.6)] dark:bg-[rgba(255,255,255,0.15)] hover:bg-[#006039]"
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
