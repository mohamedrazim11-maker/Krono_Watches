"use client";

export const TRUST_PILLARS_DATA = [
  {
    icon: "01",
    title: "5-Year Certified Warranty",
    desc: "Every mechanical calibre is serialized, COSC/Superlative tested, and backed by international concierge coverage.",
  },
  {
    icon: "02",
    title: "Insured Air Courier",
    desc: "Dispatched in handcrafted green lacquered presentation boxes with full door-to-door transit insurance.",
  },
  {
    icon: "03",
    title: "Sapphire & Oystersteel",
    desc: "Diamond-grade scratch-resistant sapphire crystal paired with anti-corrosive 904L / 316L luxury alloys.",
  },
  {
    icon: "04",
    title: "Private Concierge Care",
    desc: "Complimentary custom bracelet sizing, private Geneva salon consultations, and 30-day return privileges.",
  },
];

export default function TrustPillars() {
  return (
    <section className="rounded-3xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white via-[#F8FAF9] to-[#F1F5F3] dark:from-[#0B1C15] dark:via-[#06110D] dark:to-[#030806] shadow-xl transition-colors duration-300 relative overflow-hidden">
      {/* Background Green Accent */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#006039]/5 dark:bg-[#00824E]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center max-w-xl mx-auto space-y-2 mb-8 relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#006039] dark:text-[#4ADE80] font-bold">
          The Atelier Standard
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase">
          Guarantees of <span className="rolex-gradient-text">Excellence</span>
        </h2>
        <p className="text-xs text-[#5A6D64] dark:text-[#CBD5E1]">
          Uncompromising pedigree backed by Swiss certified horological mastery
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {TRUST_PILLARS_DATA.map((pillar, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] p-5 space-y-3 bg-white/90 dark:bg-[#11261D]/80 backdrop-blur-md hover:border-[#006039] dark:hover:border-[#00A362] hover:shadow-xl transition-all duration-300 group"
          >
            <div className="text-xs font-mono font-black text-white w-8 h-8 rounded-xl flex items-center justify-center bg-[#006039] dark:bg-[#00824E] shadow-md group-hover:scale-110 transition-transform">
              {pillar.icon}
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-display">
              {pillar.title}
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed font-sans">
              {pillar.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
