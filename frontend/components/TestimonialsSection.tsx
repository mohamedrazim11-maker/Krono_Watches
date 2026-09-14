"use client";

export const TESTIMONIALS_DATA = [
  {
    quote:
      "The hand-finished bevels, dial depth, and silent sweep of the mechanical calibre rival timepieces quadruple the price. The serialized warranty card in the lacquered box is perfection.",
    name: "Dr. Alexander Sterling",
    role: "Collector & Chronograph Connoisseur",
    city: "London",
  },
  {
    quote:
      "Unboxing was a truly royal experience — heavy lacquered case, certified warranty certificate, and accuracy calibrated well within COSC standards on my timegrapher.",
    name: "Marcus Vance",
    role: "Horology Enthusiast",
    city: "New York",
  },
  {
    quote:
      "The private concierge team reached out immediately to size the solid link bracelet before express courier dispatch. Exemplary luxury service from start to finish.",
    name: "Elena Rostova",
    role: "Private Watch Collector",
    city: "Geneva",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pb-3.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] dark:text-[#E5C158] font-bold">
            Collector Endorsements
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#121826] dark:text-[#F8FAFC] uppercase tracking-tight">
            The <span className="gold-gradient-text">Horological Guild</span>
          </h2>
        </div>
        <div className="text-xs text-[#D4AF37] dark:text-[#E5C158] font-mono font-bold flex items-center gap-1.5">
          <span>★★★★★</span>
          <span className="text-[#8C7B65] dark:text-[#CBD5E1]">4.98 / 5.0 (1,240+ Verified Collectors)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTIMONIALS_DATA.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.14)] p-5 space-y-4 flex flex-col justify-between bg-white dark:bg-[#0E1420] hover:border-[#D4AF37] dark:hover:border-[#E5C158] hover:shadow-xl transition-all duration-300 shadow-md"
          >
            <div className="space-y-2">
              <div className="text-[#D4AF37] text-sm">★★★★★</div>
              <p className="text-xs text-[#645A4C] dark:text-[#CBD5E1] leading-relaxed italic font-normal">
                "{item.quote}"
              </p>
            </div>

            <div className="pt-3 border-t border-[#EBE5DB] dark:border-[#182234] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#121826] dark:text-[#F8FAFC] font-display">
                  {item.name}
                </div>
                <div className="text-[10px] text-[#8C7B65] dark:text-[#64748B] font-sans">{item.role}</div>
              </div>
              <div className="text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#141D2E] text-[#8C6212] dark:text-[#F3E5AB] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] font-bold">
                {item.city}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
