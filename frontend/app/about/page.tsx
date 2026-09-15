"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        {/* Hero */}
        <div className="space-y-4 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C5A059] font-bold">
            Atelier Pedigree • Genève
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white font-sans">
            The Philosophy of <br />
            <span className="text-[#C5A059]">Perpetual Precision</span>
          </h1>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-mono">
            Founded with an uncompromising horological mission: to curate authentic Superlative-calibre mechanical movements, solid precious metals, and unyielding lifetime precision directly for discerning global collectors.
          </p>
        </div>

        {/* Narrative & Atelier Photo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-[#0D0D0D] border border-[#1a1a1a] p-6 sm:p-10">
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
              The Atelier Heritage
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white uppercase">
              Centuries of Swiss Craftsmanship Modernized
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-mono">
              At Krono Atelier, true horology is measured in the enduring devotion to micro-mechanical artistry. Every mechanical escapement is regulated by master horologists under high optical magnification in Geneva.
            </p>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-mono">
              From our flagship ateliers in Geneva to private consultation salons in London, New York, and Dubai, Krono timepieces represent the apex of serialized horological design.
            </p>
          </div>

          <div className="relative aspect-square bg-black border border-white/10 overflow-hidden">
            <SmoothImage
              src="/images/watches/aurelia_master_classic.jpg"
              alt="Swiss Horology Atelier"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-6 space-y-2">
            <div className="text-xl text-[#C5A059]">✦</div>
            <h3 className="text-sm font-serif font-bold uppercase text-white">Serialized Provenance</h3>
            <p className="text-xs text-white/60 font-mono leading-relaxed">
              Every timepiece registered in our vault is certified with original manufacture documentation and blockchain serial tracking.
            </p>
          </div>

          <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-6 space-y-2">
            <div className="text-xl text-[#C5A059]">⚖</div>
            <h3 className="text-sm font-serif font-bold uppercase text-white">Master Chronometer Testing</h3>
            <p className="text-xs text-white/60 font-mono leading-relaxed">
              Tested to strict METAS and COSC standards, resistant to magnetic flux reaching 15,000 gauss with guaranteed deviation tolerances.
            </p>
          </div>

          <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-6 space-y-2">
            <div className="text-xl text-[#C5A059]">🛡</div>
            <h3 className="text-sm font-serif font-bold uppercase text-white">Armored Global Transit</h3>
            <p className="text-xs text-white/60 font-mono leading-relaxed">
              Dispatched with private insured armored couriers directly to your residence, private yacht, or regional security deposit vault.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8 border-t border-[#1a1a1a] space-y-4">
          <h2 className="text-xl font-serif font-bold uppercase text-white">Explore the Current Vault</h2>
          <Link
            href="/catalog"
            className="inline-block px-8 py-3.5 bg-[#C5A059] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#b08d48] transition-colors"
          >
            Access Complete Catalogue
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
