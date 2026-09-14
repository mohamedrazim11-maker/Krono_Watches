"use client";

export const TRUST_PILLARS_DATA = [
  {
    icon: "01",
    title: "5-Year Certified Warranty",
    desc: "Every mechanical calibre is serialized, COSC tested, and protected under our worldwide concierge warranty.",
  },
  {
    icon: "02",
    title: "Insured Air Courier",
    desc: "Dispatched in handcrafted lacquered presentation cases with full door-to-door transit insurance.",
  },
  {
    icon: "03",
    title: "Sapphire & 316L Alloy",
    desc: "Diamond-grade scratch-resistant sapphire crystal paired with anti-corrosive surgical grade alloy.",
  },
  {
    icon: "04",
    title: "Private Concierge Care",
    desc: "Complimentary custom wrist sizing adjustments, private salon consultation, and 30-day return privileges.",
  },
];

export default function TrustPillars() {
  return (
    <section className="rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white via-[#FAF8F5] to-[#F3EFEA] dark:from-[#0E1420] dark:via-[#080B10] dark:to-[#040609] shadow-xl transition-colors duration-300 relative overflow-hidden">
      {/* Background Gold Accent */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#D4AF37]/5 dark:bg-[#E5C158]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center max-w-xl mx-auto space-y-2 mb-8 relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37] dark:text-[#E5C158] font-bold">
          The Atelier Standard
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#121826] dark:text-[#F8FAFC] tracking-tight uppercase">
          Guarantees of <span className="gold-gradient-text">Excellence</span>
        </h2>
        <p className="text-xs text-[#8C7B65] dark:text-[#CBD5E1]">
          Uncompromising pedigree backed by Swiss certified horological mastery
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {TRUST_PILLARS_DATA.map((pillar, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] p-5 space-y-3 bg-white/80 dark:bg-[#141D2E]/80 backdrop-blur-md hover:border-[#D4AF37] dark:hover:border-[#E5C158] hover:shadow-xl transition-all duration-300 group"
          >
            <div className="text-xs font-mono font-black text-[#080B10] w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] shadow-md group-hover:scale-110 transition-transform">
              {pillar.icon}
            </div>
            <h3 className="text-sm font-bold text-[#121826] dark:text-[#F8FAFC] font-display">
              {pillar.title}
            </h3>
            <p className="text-xs text-[#645A4C] dark:text-[#CBD5E1] leading-relaxed font-sans">
              {pillar.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
