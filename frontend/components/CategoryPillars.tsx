"use client";

import Link from "next/link";
import { useState } from "react";
import SmoothImage from "./SmoothImage";

export const CATEGORIES_DATA = [
  {
    slug: "Luxury",
    title: "Grand Complications",
    badge: "Haute Horlogerie",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
    description: "Multi-axis tourbillons and perpetual calendars crafted in 18k precious gold alloys.",
  },
  {
    slug: "Automatic",
    title: "Automatic Heritage",
    badge: "Geneva Standard",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    description: "Self-winding mechanical calibres regulated to -2/+2 seconds chronometer precision.",
  },
  {
    slug: "Sport",
    title: "Sport & Chronograph",
    badge: "Grade 5 Titanium",
    image: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=900&q=80",
    description: "Cerachrom tachymeters and 300m helium escape valves built for extreme resilience.",
  },
  {
    slug: "Smart",
    title: "Biometric Precision",
    badge: "Connected Horology",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description: "Sapphire crystal telemetry seamlessly merged with hand-finished Swiss micro-architecture.",
  },
];

interface CategoryPillarsProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export default function CategoryPillars({ selectedCategory, onSelectCategory }: CategoryPillarsProps) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pb-3.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] dark:text-[#E5C158] font-bold">
            Curated Metiers
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#121826] dark:text-[#F8FAFC] tracking-tight uppercase">
            Pillars of <span className="gold-gradient-text">Horological Craft</span>
          </h2>
        </div>
        <Link
          href="/catalog"
          className="text-xs font-mono font-bold text-[#8C7B65] dark:text-[#CBD5E1] hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span>Explore All 2026 Series</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES_DATA.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <div
              key={cat.slug}
              onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border bg-white dark:bg-[#0E1420] ${
                isSelected
                  ? "border-[#D4AF37] dark:border-[#E5C158] ring-2 ring-[#D4AF37]/30 shadow-xl shadow-[#D4AF37]/15 scale-[1.02]"
                  : "border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] hover:border-[#D4AF37] dark:hover:border-[rgba(212,175,55,0.4)] hover:-translate-y-1 shadow-md hover:shadow-xl"
              }`}
            >
              <div className="aspect-[4/5] w-full relative overflow-hidden bg-[#F3EFEA] dark:bg-[#080B10]">
                <SmoothImage
                  src={cat.image}
                  alt={cat.title}
                  className="transition-transform duration-700 group-hover:scale-108 filter brightness-[0.92] group-hover:brightness-100"
                  containerClassName="w-full h-full"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040609]/95 via-[#080B10]/40 to-transparent pointer-events-none"></div>

                <div className="absolute top-3 left-3 pointer-events-none">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] shadow-md">
                    {cat.badge}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 space-y-1 text-white">
                  <div className="text-[9px] text-[#F3E5AB] font-mono uppercase tracking-wider font-semibold">
                    {cat.slug} Series
                  </div>
                  <h3 className="text-base font-bold text-white font-display">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-[#CBD5E1] line-clamp-2 leading-relaxed font-sans">
                    {cat.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
