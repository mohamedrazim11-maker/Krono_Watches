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
    <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 bg-white dark:bg-[#131B2A] shadow-sm transition-colors duration-200">
      <div className="text-center max-w-xl mx-auto space-y-1.5 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-bold">
          The Atelier Standard
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight uppercase">
          Guarantees of <span className="text-slate-900 dark:text-white underline decoration-slate-300 dark:decoration-slate-700 decoration-2">Excellence</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_PILLARS_DATA.map((pillar, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-2 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition duration-300"
          >
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm">
              {pillar.icon}
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display">
              {pillar.title}
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {pillar.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
