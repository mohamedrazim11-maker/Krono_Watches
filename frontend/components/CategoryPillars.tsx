"use client";

import Link from "next/link";
import SmoothImage from "./SmoothImage";

export const CATEGORIES_DATA = [
  {
    slug: "Luxury",
    title: "Classic & Dress",
    badge: "Haute Horlogerie",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
    description: "Fluted bezels, precious dials, and perpetual movements crafted in 18k Everose, yellow, and white gold.",
  },
  {
    slug: "Automatic",
    title: "Master Chronometer",
    badge: "Geneva Standard",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    description: "Self-winding mechanical calibres regulated to Superlative Chronometer -2/+2 sec precision.",
  },
  {
    slug: "Sport",
    title: "Professional & Diver",
    badge: "Oystersteel & Ceramic",
    image: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=900&q=80",
    description: "Cerachrom ceramic bezels, Triplock crowns, and Helium Escape Valves tested for supreme resilience.",
  },
  {
    slug: "Smart",
    title: "Avant-Garde Telemetry",
    badge: "Connected Calibre",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description: "Sapphire crystal displays and Grade 2 titanium chassis fused with Swiss ergonomics.",
  },
];

interface CategoryPillarsProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export default function CategoryPillars({ selectedCategory, onSelectCategory }: CategoryPillarsProps) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] pb-3.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80] font-bold">
            Curated Collections
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase">
            Pillars of <span className="rolex-gradient-text">Horological Craft</span>
          </h2>
        </div>
        <Link
          href="/catalog"
          className="text-xs font-mono font-bold text-[#5A6D64] dark:text-[#CBD5E1] hover:text-[#006039] dark:hover:text-[#4ADE80] transition flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span>Explore All 2026 References</span>
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
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border bg-white dark:bg-[#0B1C15] ${
                isSelected
                  ? "border-[#006039] dark:border-[#00A362] ring-2 ring-[#006039]/30 shadow-xl shadow-[#006039]/20 scale-[1.02]"
                  : "border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] hover:border-[#006039] dark:hover:border-[rgba(0,163,98,0.5)] hover:-translate-y-1 shadow-sm hover:shadow-xl"
              }`}
            >
              <div className="aspect-[4/5] w-full relative overflow-hidden bg-[#F1F5F3] dark:bg-[#06110D]">
                <SmoothImage
                  src={cat.image}
                  alt={cat.title}
                  className="transition-transform duration-700 group-hover:scale-108 filter brightness-[0.92] group-hover:brightness-100"
                  containerClassName="w-full h-full"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040C09]/95 via-[#06110D]/40 to-transparent pointer-events-none"></div>

                <div className="absolute top-3 left-3 pointer-events-none">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#006039] text-white shadow-md">
                    {cat.badge}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 space-y-1 text-white">
                  <div className="text-[9px] text-[#C5A059] font-mono uppercase tracking-wider font-semibold">
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
