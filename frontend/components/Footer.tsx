"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] bg-white dark:bg-[#040609] text-[#645A4C] dark:text-[#CBD5E1] text-xs font-sans transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Brand & VIP Gazette */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-0.5 rounded-xl bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#8C6212] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/icon.jpg"
                  alt="Krono Logo"
                  className="h-9 w-9 rounded-[10px] object-contain bg-[#080B10] p-0.5"
                />
              </div>
              <div className="text-base font-black tracking-[0.25em] text-[#121826] dark:text-[#F8FAFC] uppercase font-display">
                K R O N O
              </div>
            </Link>
            <p className="text-[#8C7B65] dark:text-[#CBD5E1] text-xs leading-relaxed max-w-sm">
              Precision Swiss mechanical horology. Hand-calibrated escapements, serialized exhibition casebacks, and diamond-grade sapphire crystals.
            </p>

            {/* Newsletter Gazette Form */}
            <div className="pt-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] dark:text-[#E5C158] font-mono font-bold mb-2">
                Private Gazette Registry
              </div>
              {subscribed ? (
                <div className="text-[#059669] dark:text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#10B981]/40 px-3.5 py-2 rounded-xl text-xs font-semibold">
                  ✓ Enrolled in the Krono Private Registry. Welcome.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter collector email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] rounded-xl px-3.5 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] placeholder-[#8C7B65] dark:placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="submit"
                    className="lux-btn-gold px-4 py-2 rounded-xl text-xs cursor-pointer uppercase tracking-wider font-extrabold shadow-md"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Salons */}
          <div className="space-y-3">
            <h4 className="text-[#121826] dark:text-[#F8FAFC] text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pb-1.5">
              Private Salons
            </h4>
            <ul className="space-y-2 text-xs text-[#645A4C] dark:text-[#CBD5E1]">
              <li>
                <span className="text-[#121826] dark:text-[#F3E5AB] font-semibold">Genève Atelier</span>
                <div className="text-[11px] text-[#8C7B65] dark:text-[#64748B]">Rue du Rhône 42, Switzerland</div>
              </li>
              <li>
                <span className="text-[#121826] dark:text-[#F3E5AB] font-semibold">London Mayfair</span>
                <div className="text-[11px] text-[#8C7B65] dark:text-[#64748B]">14 New Bond Street, UK</div>
              </li>
              <li>
                <span className="text-[#121826] dark:text-[#F3E5AB] font-semibold">New York 5th Ave</span>
                <div className="text-[11px] text-[#8C7B65] dark:text-[#64748B]">745 Fifth Avenue, NY</div>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h4 className="text-[#121826] dark:text-[#F8FAFC] text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pb-1.5">
              Curations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalog" className="text-[#645A4C] dark:text-[#CBD5E1] hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition">
                  Grand Complications
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-[#645A4C] dark:text-[#CBD5E1] hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition">
                  Automatic Mechanicals
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-[#645A4C] dark:text-[#CBD5E1] hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition">
                  Titanium Chronographs
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#645A4C] dark:text-[#CBD5E1] hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition">
                  Atelier Heritage
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-3">
            <h4 className="text-[#121826] dark:text-[#F8FAFC] text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pb-1.5">
              Guarantees
            </h4>
            <ul className="space-y-2 text-xs text-[#645A4C] dark:text-[#CBD5E1]">
              <li className="flex items-center gap-1.5">
                <span className="text-[#D4AF37]">✦</span> 5-Year Certified Warranty
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#D4AF37]">✦</span> Insured Global Air Courier
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#D4AF37]">✦</span> Serialized Authenticity Card
              </li>
              <li className="pt-2">
                <Link href="/admin" className="text-[#D4AF37] dark:text-[#E5C158] font-bold hover:underline text-[11px] flex items-center gap-1">
                  <span>Management Console</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & Swiss Badges */}
        <div className="border-t border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8C7B65] dark:text-[#CBD5E1]">
          <div>
            © {new Date().getFullYear()} KRONO ATELIER S.A. Registered Swiss Horologists.
          </div>
          <div className="flex items-center gap-4 text-[#8C7B65] dark:text-[#A3937C] font-mono text-[10px]">
            <span className="text-[#D4AF37]">COSC CHRONOMETER</span>
            <span>•</span>
            <span>256-BIT SSL ENCRYPTION</span>
            <span>•</span>
            <span className="text-[#D4AF37]">GENÈVE REGISTRY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
