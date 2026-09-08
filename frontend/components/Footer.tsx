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
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 text-xs font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/icon.jpg"
                alt="Krono Logo"
                className="h-9 w-9 rounded-xl object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200/90 dark:border-slate-700 shadow-sm group-hover:scale-105 transition"
              />
              <div className="text-sm font-black tracking-[0.25em] text-slate-900 dark:text-white uppercase font-display">
                K R O N O
              </div>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
              Precision Swiss mechanical watchmaking. Hand-calibrated escapements, serialized exhibition casebacks, and diamond-grade sapphire crystal.
            </p>

            {/* Newsletter */}
            <div className="pt-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200 font-mono font-bold mb-1.5">
                Private Gazette Subscription
              </div>
              {subscribed ? (
                <div className="text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-medium">
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
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                  />
                  <button
                    type="submit"
                    className="lux-btn-primary px-3.5 py-2 rounded-lg text-xs cursor-pointer uppercase tracking-wider font-bold"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Salons */}
          <div className="space-y-2.5">
            <h4 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Boutiques
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">Genève Atelier</span>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Rue du Rhône 42, Switzerland</div>
              </li>
              <li>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">London Mayfair</span>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">14 New Bond Street, UK</div>
              </li>
              <li>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">New York 5th Ave</span>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">745 Fifth Avenue, NY</div>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div className="space-y-2.5">
            <h4 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Collections
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/catalog" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                  Grand Complications
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                  Automatic Mechanicals
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                  Titanium Chronographs
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                  Atelier Heritage
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-2.5">
            <h4 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Guarantees
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>• 5-Year Certified Warranty</li>
              <li>• Insured Global Air Courier</li>
              <li>• Serialized Authenticity Card</li>
              <li className="pt-1">
                <Link href="/admin" className="text-slate-900 dark:text-slate-200 font-bold hover:underline text-[11px]">
                  Management Console →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} KRONO ATELIER S.A. Registered Swiss Horologists.
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
            <span>COSC STANDARD</span>
            <span>•</span>
            <span>256-BIT SSL ENCRYPTION</span>
            <span>•</span>
            <span>WORLDWIDE TRANSIT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
