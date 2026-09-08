"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustPillars from "@/components/TrustPillars";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white dark:selection:bg-amber-400 dark:selection:text-slate-950">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12 space-y-12 sm:space-y-16">
        {/* Hero */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            Atelier Pedigree • Genève
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
            The Philosophy of <br />
            <span className="text-slate-900 dark:text-amber-400 underline decoration-slate-300 dark:decoration-slate-700 decoration-2">Pure Precision</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-normal">
            Founded with a singular horological mission: to deliver certified Swiss-calibre mechanical movements, surgical-grade 316L stainless steel, and unyielding lifetime precision directly to discerning collectors.
          </p>
        </div>

        {/* Narrative & Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3.5">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-bold">
              The Atelier Heritage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white uppercase">
              Centuries of Craftsmanship Modernized
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              At Krono Atelier, we believe that true luxury is measured in the enduring devotion to micro-mechanical artistry. Every mechanical escapement is regulated by master horologists under 40x optical magnification.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              From our flagship ateliers in Geneva to private consultation salons in London, New York, and Dubai, Krono timepieces represent the apex of horological design.
            </p>
          </div>

          <div className="relative rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 overflow-hidden bg-white dark:bg-[#131B2A] shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80"
              alt="Horology Craftsmanship"
              className="rounded-2xl w-full h-72 object-cover filter brightness-95"
            />
            <div className="absolute bottom-6 left-6 right-6 p-3 rounded-xl bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono uppercase font-bold">Geneva Standard</div>
              <div className="text-xs text-slate-900 dark:text-white font-bold font-display">COSC Certified Calibre Regulation</div>
            </div>
          </div>
        </div>

        {/* Guarantees */}
        <TrustPillars />

        {/* Action Banner */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 space-y-4 text-center max-w-3xl mx-auto bg-white dark:bg-[#131B2A] shadow-md">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-bold">
              Private Vault Inspection
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 dark:text-white uppercase">
              Every Second Counts. Every Calibre Matters.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
            Discover serialized mechanical masterpieces protected by our 5-year concierge warranty and worldwide insured air transit.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/catalog"
              className="lux-btn-primary px-7 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-black shadow-md hover:shadow-lg transition"
            >
              Explore Timepiece Vault →
            </Link>
            <Link
              href="/"
              className="lux-btn-secondary px-5 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-bold shadow-sm"
            >
              Back to Storefront
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
