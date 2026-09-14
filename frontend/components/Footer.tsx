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
    <footer className="border-t border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] bg-white dark:bg-[#040C09] text-[#475569] dark:text-[#CBD5E1] text-xs font-sans transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Brand & VIP Gazette */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-0.5 rounded-xl bg-gradient-to-br from-[#C5A059] via-[#006039] to-[#00482B] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/icon.jpg"
                  alt="Krono Logo"
                  className="h-9 w-9 rounded-[10px] object-contain bg-[#06110D] p-0.5"
                />
              </div>
              <div className="text-base font-black tracking-[0.25em] text-[#0F172A] dark:text-[#F8FAFC] uppercase font-display">
                K R O N O
              </div>
            </Link>
            <p className="text-[#5A6D64] dark:text-[#CBD5E1] text-xs leading-relaxed max-w-sm">
              Precision Swiss mechanical horology. Superlative chronometer escapements, serialized exhibition casebacks, and diamond-grade sapphire crystals.
            </p>

            {/* Newsletter Gazette Form */}
            <div className="pt-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#006039] dark:text-[#4ADE80] font-mono font-bold mb-2">
                Private Gazette Registry
              </div>
              {subscribed ? (
                <div className="text-[#006039] dark:text-[#4ADE80] bg-[#E8F5EE] dark:bg-[#11261D] border border-[#006039]/40 px-3.5 py-2 rounded-xl text-xs font-semibold">
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
                    className="flex-1 bg-[#F8FAF9] dark:bg-[#0B1C15] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#8EAA9C] focus:outline-none focus:border-[#006039]"
                  />
                  <button
                    type="submit"
                    className="lux-btn-primary px-4 py-2 rounded-xl text-xs cursor-pointer uppercase tracking-wider font-extrabold shadow-md"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Salons */}
          <div className="space-y-3">
            <h4 className="text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] pb-1.5">
              Private Salons
            </h4>
            <ul className="space-y-2 text-xs text-[#475569] dark:text-[#CBD5E1]">
              <li>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold">Genève Atelier</span>
                <div className="text-[11px] text-[#5A6D64] dark:text-[#8EAA9C]">Rue du Rhône 42, Switzerland</div>
              </li>
              <li>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold">London Mayfair</span>
                <div className="text-[11px] text-[#5A6D64] dark:text-[#8EAA9C]">14 New Bond Street, UK</div>
              </li>
              <li>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold">New York 5th Ave</span>
                <div className="text-[11px] text-[#5A6D64] dark:text-[#8EAA9C]">745 Fifth Avenue, NY</div>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h4 className="text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] pb-1.5">
              Curations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalog" className="text-[#475569] dark:text-[#CBD5E1] hover:text-[#006039] dark:hover:text-[#4ADE80] transition">
                  Grand Complications
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-[#475569] dark:text-[#CBD5E1] hover:text-[#006039] dark:hover:text-[#4ADE80] transition">
                  Automatic Mechanicals
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-[#475569] dark:text-[#CBD5E1] hover:text-[#006039] dark:hover:text-[#4ADE80] transition">
                  Titanium Chronographs
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#475569] dark:text-[#CBD5E1] hover:text-[#006039] dark:hover:text-[#4ADE80] transition">
                  Atelier Heritage
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-3">
            <h4 className="text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] pb-1.5">
              Guarantees
            </h4>
            <ul className="space-y-2 text-xs text-[#475569] dark:text-[#CBD5E1]">
              <li className="flex items-center gap-1.5">
                <span className="text-[#006039] dark:text-[#4ADE80]">✦</span> 5-Year Certified Warranty
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#006039] dark:text-[#4ADE80]">✦</span> Insured Global Air Courier
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#006039] dark:text-[#4ADE80]">✦</span> Serialized Authenticity Card
              </li>
              <li className="pt-2">
                <Link href="/admin" className="text-[#006039] dark:text-[#4ADE80] font-bold hover:underline text-[11px] flex items-center gap-1">
                  <span>Management Console</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & Swiss Badges */}
        <div className="border-t border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#5A6D64] dark:text-[#CBD5E1]">
          <div>
            © {new Date().getFullYear()} KRONO ATELIER S.A. Registered Swiss Horologists.
          </div>
          <div className="flex items-center gap-4 text-[#5A6D64] dark:text-[#8EAA9C] font-mono text-[10px]">
            <span className="text-[#006039] dark:text-[#4ADE80]">SUPERLATIVE CHRONOMETER</span>
            <span>•</span>
            <span>256-BIT SSL ENCRYPTION</span>
            <span>•</span>
            <span className="text-[#006039] dark:text-[#4ADE80]">GENÈVE REGISTRY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
