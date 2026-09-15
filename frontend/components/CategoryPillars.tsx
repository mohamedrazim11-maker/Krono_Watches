"use client";

import Link from "next/link";
import SmoothImage from "./SmoothImage";

export const CATEGORIES_DATA = [
  {
    slug: "Dive Watches",
    title: "Deep Sea & Maritime Diver",
    badge: "300m Professional",
    image: "/images/watches/submariner_deep_black_ceramic.jpg",
    description: "Cerachrom ceramic bezels, Triplock helium crowns, and Lumibrite indices crafted for underwater resilience.",
  },
  {
    slug: "Dress Watches",
    title: "Classic & Haute Horlogerie",
    badge: "Precious Metals",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
    description: "Solid 18k Everose, President bracelets, Zaratsu polish, and guilloché dials tailored for formal prestige.",
  },
  {
    slug: "Chronograph",
    title: "Motorsport & Space Telemetry",
    badge: "Column-Wheel Calibre",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80",
    description: "Tachymeter scales, sub-second chronograph registers, and flight-qualified NASA timing heritage.",
  },
  {
    slug: "Automatic",
    title: "Spring Drive & Mechanical",
    badge: "Geneva & Japanese Craft",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
    description: "Self-winding Swiss Powermatic and Grand Seiko Spring Drive calibres with continuous seconds glide.",
  },
  {
    slug: "Digital",
    title: "Atomic & Tough Solar",
    badge: "Multi-Band 6 Guard",
    image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=900&q=80",
    description: "Full metal screw-back cases, triple sensor altimeters, and solar-powered smartphone radio sync.",
  },
  {
    slug: "Sports Watches",
    title: "Dual Time & Extreme Endurance",
    badge: "GMT & Dual Core",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=80",
    description: "Dual-timezone 24h bezels, carbon core guard architecture, and resilient Oystersteel casings.",
  },
];

interface CategoryPillarsProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export default function CategoryPillars({ selectedCategory, onSelectCategory }: CategoryPillarsProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pb-4">
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
          <span>Explore All 25 References</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES_DATA.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <div
              key={cat.slug}
              onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 p-2 ${
                isSelected
                  ? "neu-inset scale-[1.02] border-2 border-[#006039] dark:border-[#00A362]"
                  : "neu-card hover:-translate-y-1.5"
              }`}
            >
              <div className="aspect-[4/3] w-full relative overflow-hidden rounded-2xl neu-inset">
                <SmoothImage
                  src={cat.image}
                  alt={cat.title}
                  className="transition-transform duration-700 group-hover:scale-108 filter brightness-[0.92] group-hover:brightness-100"
                  containerClassName="w-full h-full"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040C09]/95 via-[#06110D]/45 to-transparent pointer-events-none"></div>

                <div className="absolute top-3.5 left-3.5 pointer-events-none">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full neu-raised-sm bg-[#006039] text-white">
                    {cat.badge}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 space-y-1 text-white">
                  <div className="text-[9px] text-[#C5A059] dark:text-[#D4AF37] font-mono uppercase tracking-wider font-semibold">
                    {cat.slug}
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
