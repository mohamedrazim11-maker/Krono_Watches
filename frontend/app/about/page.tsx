"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustPillars from "@/components/TrustPillars";
import SmoothImage from "@/components/SmoothImage";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#080B10] text-[#121826] dark:text-[#F8FAFC] selection:bg-[#D4AF37] selection:text-[#080B10] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {/* Hero */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37] dark:text-[#E5C158] font-bold bg-[#FAF8F5] dark:bg-[#141D2E] px-4 py-1.5 rounded-full border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] shadow-sm">
            Atelier Pedigree • Genève
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-[#121826] dark:text-[#F8FAFC] uppercase tracking-tight">
            The Philosophy of <br />
            <span className="gold-gradient-text">Pure Precision</span>
          </h1>
          <p className="text-[#645A4C] dark:text-[#CBD5E1] text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-normal">
            Founded with a singular horological mission: to deliver certified Swiss-calibre mechanical movements, surgical-grade 316L stainless steel, and unyielding lifetime precision directly to discerning collectors.
          </p>
        </div>

        {/* Narrative & Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] dark:text-[#E5C158] font-bold">
              The Atelier Heritage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#121826] dark:text-[#F8FAFC] uppercase">
              Centuries of Craftsmanship Modernized
            </h2>
            <p className="text-xs sm:text-sm text-[#645A4C] dark:text-[#CBD5E1] leading-relaxed font-sans">
              At Krono Atelier, we believe that true luxury is measured in the enduring devotion to micro-mechanical artistry. Every mechanical escapement is regulated by master horologists under 40x optical magnification.
            </p>
            <p className="text-xs sm:text-sm text-[#8C7B65] dark:text-[#A3937C] leading-relaxed font-sans">
              From our flagship ateliers in Geneva to private consultation salons in London, New York, and Dubai, Krono timepieces represent the apex of horological design.
            </p>
          </div>

          <div className="relative rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] p-3 overflow-hidden bg-white dark:bg-[#0E1420] shadow-xl">
            <SmoothImage
              src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80"
              alt="Horology Craftsmanship"
              className="rounded-2xl filter brightness-95"
              containerClassName="rounded-2xl w-full h-72"
            />
            <div className="absolute bottom-6 left-6 right-6 p-3.5 rounded-xl bg-white/95 dark:bg-[#080B10]/95 backdrop-blur-md border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] shadow-lg pointer-events-none">
              <div className="text-[9px] text-[#D4AF37] font-mono uppercase font-bold">Geneva Standard</div>
              <div className="text-xs text-[#121826] dark:text-[#F8FAFC] font-bold font-display">COSC Certified Calibre Regulation</div>
            </div>
          </div>
        </div>

        {/* Guarantees */}
        <TrustPillars />

        {/* Action Banner */}
        <div className="rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] p-8 sm:p-12 space-y-4 text-center max-w-3xl mx-auto bg-gradient-to-br from-white via-[#FAF8F5] to-[#F3EFEA] dark:from-[#0E1420] dark:via-[#080B10] dark:to-[#040609] shadow-xl">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37] dark:text-[#E5C158] font-bold">
              Private Vault Inspection
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-[#121826] dark:text-[#F8FAFC] uppercase">
              Every Second Counts. Every Calibre Matters.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#645A4C] dark:text-[#CBD5E1] leading-relaxed max-w-xl mx-auto">
            Discover serialized mechanical masterpieces protected by our 5-year concierge warranty and worldwide insured air transit.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/catalog"
              className="lux-btn-gold px-7 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-black shadow-lg hover:shadow-xl transition"
            >
              Explore Timepiece Vault →
            </Link>
            <Link
              href="/"
              className="lux-btn-secondary px-6 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-bold shadow-sm"
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
