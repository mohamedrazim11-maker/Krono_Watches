"use client";

export const TESTIMONIALS_DATA = [
  {
    quote:
      "The hand-finished bevels, dial depth, and silent sweep of the mechanical calibre rival timepieces quadruple the price. The serialized warranty card in the green lacquered box is perfection.",
    name: "Dr. Alexander Sterling",
    role: "Collector & Chronograph Connoisseur",
    city: "London",
  },
  {
    quote:
      "Unboxing was a truly royal experience — heavy presentation case, certified warranty certificate, and accuracy calibrated well within Superlative Chronometer standards on my timegrapher.",
    name: "Marcus Vance",
    role: "Horology Enthusiast",
    city: "New York",
  },
  {
    quote:
      "The private concierge team reached out immediately to size the solid link Oyster bracelet before express courier dispatch. Exemplary luxury service from start to finish.",
    name: "Elena Rostova",
    role: "Private Watch Collector",
    city: "Geneva",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] pb-3.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80] font-bold">
            Collector Endorsements
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight">
            The <span className="rolex-gradient-text">Horological Guild</span>
          </h2>
        </div>
        <div className="text-xs text-[#006039] dark:text-[#4ADE80] font-mono font-bold flex items-center gap-1.5">
          <span className="text-[#C5A059]">★★★★★</span>
          <span className="text-[#5A6D64] dark:text-[#CBD5E1]">4.98 / 5.0 (1,240+ Verified Collectors)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTIMONIALS_DATA.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] p-5 space-y-4 flex flex-col justify-between bg-white dark:bg-[#0B1C15] hover:border-[#006039] dark:hover:border-[#00A362] hover:shadow-xl transition-all duration-300 shadow-sm"
          >
            <div className="space-y-2">
              <div className="text-[#C5A059] text-sm">★★★★★</div>
              <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed italic font-normal">
                "{item.quote}"
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5ECE8] dark:border-[#122B20] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] font-display">
                  {item.name}
                </div>
                <div className="text-[10px] text-[#5A6D64] dark:text-[#8EAA9C] font-sans">{item.role}</div>
              </div>
              <div className="text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-[#E8F5EE] dark:bg-[#11261D] text-[#006039] dark:text-[#4ADE80] border border-[#006039]/30 font-bold">
                {item.city}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
