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
    description: "Multi-axis tourbillons and skeletonized dials crafted in precious monochrome alloys.",
  },
  {
    slug: "Automatic",
    title: "Automatic Heritage",
    badge: "Geneva Standard",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    description: "Self-winding mechanical calibres calibrated to +2/-2 seconds per day.",
  },
  {
    slug: "Sport",
    title: "Sport & Chronograph",
    badge: "Grade 5 Titanium",
    image: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=900&q=80",
    description: "Ceramic bezels and helium escape valves built for extreme endurance.",
  },
  {
    slug: "Smart",
    title: "Biometric Precision",
    badge: "Next Gen Connected",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description: "High-grade mechanical design combined with sapphire optical sensors.",
  },
];

interface CategoryPillarsProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export default function CategoryPillars({ selectedCategory, onSelectCategory }: CategoryPillarsProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-bold">
            Curated Metiers
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight uppercase">
            Pillars of <span className="text-slate-900 dark:text-white underline decoration-slate-300 dark:decoration-slate-700 decoration-2">Horology</span>
          </h2>
        </div>
        <Link
          href="/catalog"
          className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span>View All References</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {CATEGORIES_DATA.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <div
              key={cat.slug}
              onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border bg-white dark:bg-[#131B2A] ${
                isSelected
                  ? "border-slate-900 dark:border-white shadow-lg shadow-slate-200 dark:shadow-black/50 scale-[1.01]"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:-translate-y-0.5 shadow-sm"
              }`}
            >
              <div className="aspect-[4/5] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                <SmoothImage
                  src={cat.image}
                  alt={cat.title}
                  className="transition-transform duration-700 group-hover:scale-105 filter brightness-95 group-hover:brightness-100"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent pointer-events-none"></div>

                <div className="absolute top-3 left-3 pointer-events-none">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-white text-slate-900 shadow-md">
                    {cat.badge}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-3.5 space-y-0.5 text-white">
                  <div className="text-[9px] text-slate-300 font-mono uppercase tracking-wider font-semibold">
                    {cat.slug} Series
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white font-display">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] text-slate-200 line-clamp-2 leading-relaxed font-sans">
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
