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
    <section className="rounded-[2rem] neu-raised-lg p-6 sm:p-8 lg:p-10 transition-colors duration-300 relative overflow-hidden">
      <div className="text-center max-w-xl mx-auto space-y-2 mb-8 relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#006039] dark:text-[#4ADE80] font-bold neu-raised-sm px-3.5 py-1 rounded-full inline-block">
          The Atelier Standard
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase">
          Guarantees of <span className="rolex-gradient-text">Excellence</span>
        </h2>
        <p className="text-xs text-[#5A6D64] dark:text-[#CBD5E1]">
          Uncompromising pedigree backed by Swiss certified horological mastery
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        {TRUST_PILLARS_DATA.map((pillar, idx) => (
          <div
            key={idx}
            className="rounded-2xl neu-card p-5 space-y-3 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="text-xs font-mono font-black text-white w-9 h-9 rounded-xl flex items-center justify-center neu-btn-primary group-hover:scale-105 transition-transform">
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
