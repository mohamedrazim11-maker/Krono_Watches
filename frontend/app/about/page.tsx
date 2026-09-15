"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustPillars from "@/components/TrustPillars";
import SmoothImage from "@/components/SmoothImage";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8EEF3] dark:bg-[#0E1A16] text-[#0F172A] dark:text-[#F8FAFC] selection:bg-[#006039] selection:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {/* Hero */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#006039] dark:text-[#4ADE80] font-bold neu-raised-sm px-4 py-1.5 rounded-full inline-block">
            Atelier Pedigree • Genève
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight">
            The Philosophy of <br />
            <span className="rolex-gradient-text">Perpetual Precision</span>
          </h1>
          <p className="text-[#475569] dark:text-[#CBD5E1] text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-normal">
            Founded with a singular horological mission: to curate authentic Superlative-calibre mechanical movements, Oystersteel 904L aerospace alloys, and unyielding lifetime precision directly for discerning collectors.
          </p>
        </div>

        {/* Narrative & Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80] font-bold">
              The Atelier Heritage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase">
              Centuries of Craftsmanship Modernized
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed font-sans">
              At Krono Atelier, we believe that true luxury is measured in the enduring devotion to micro-mechanical artistry. Every mechanical escapement is regulated by master horologists under high optical magnification.
            </p>
            <p className="text-xs sm:text-sm text-[#5A6D64] dark:text-[#8EAA9C] leading-relaxed font-sans">
              From our flagship ateliers in Geneva to private consultation salons in London, New York, and Dubai, Krono timepieces represent the apex of horological design.
            </p>
          </div>

          <div className="relative rounded-[2rem] neu-card p-3.5 overflow-hidden">
            <SmoothImage
              src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80"
              alt="Horology Craftsmanship"
              className="rounded-2xl filter brightness-95"
              containerClassName="rounded-2xl w-full h-72 neu-inset"
            />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl neu-raised backdrop-blur-md pointer-events-none">
              <div className="text-[9px] text-[#006039] dark:text-[#4ADE80] font-mono uppercase font-bold">Geneva Standard</div>
              <div className="text-xs text-[#0F172A] dark:text-[#F8FAFC] font-bold font-display">Superlative Chronometer Calibre Regulation</div>
            </div>
          </div>
        </div>

        {/* Guarantees */}
        <TrustPillars />

        {/* Action Banner */}
        <div className="rounded-[2rem] neu-raised-lg p-8 sm:p-12 space-y-4 text-center max-w-3xl mx-auto shadow-xl">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#006039] dark:text-[#4ADE80] font-bold">
              Private Vault Inspection
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase">
              Every Second Counts. Every Calibre Matters.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed max-w-xl mx-auto">
            Discover serialized mechanical masterpieces protected by our 5-year concierge warranty and worldwide insured air transit.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/catalog"
              className="neu-btn-primary px-7 py-3 rounded-2xl text-xs uppercase tracking-[0.15em] font-black shadow-lg transition"
            >
              Explore Timepiece Vault →
            </Link>
            <Link
              href="/"
              className="neu-btn px-6 py-3 rounded-2xl text-xs uppercase tracking-[0.15em] font-bold"
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
