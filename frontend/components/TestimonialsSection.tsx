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
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-bold">
            Collector Endorsements
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
            The <span className="text-slate-900 dark:text-white underline decoration-slate-300 dark:decoration-slate-700 decoration-2">Guild</span>
          </h2>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">
          <span>★★★★★ 4.98 / 5.0 (1,240+ Verified Collectors)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTIMONIALS_DATA.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-3 flex flex-col justify-between bg-white dark:bg-[#131B2A] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition duration-300 shadow-sm"
          >
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic font-normal">
              "{item.quote}"
            </p>

            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-display">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">{item.role}</div>
              </div>
              <div className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold">
                {item.city}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
