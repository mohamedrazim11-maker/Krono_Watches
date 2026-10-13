"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C5A059] font-bold">
            Authentic Luxury Watches
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            About Krono Watches
          </h1>
          <p className="text-white/60 text-xs sm:text-sm max-w-xl mx-auto font-mono">
            Certified luxury watches curated for collectors worldwide. Guaranteed authentic with original papers and serialized international warranties.
          </p>
        </div>

        {/* Narrative & Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#0D0D0D] border border-[#1a1a1a] p-6 sm:p-8">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
              Our Standard
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white uppercase">
              Precision and Quality
            </h2>
            <p className="text-xs text-white/70 leading-relaxed font-mono">
              Every watch in our boutique undergoes rigorous testing for accuracy, water resistance, and mechanical reliability before delivery.
            </p>
            <p className="text-xs text-white/50 leading-relaxed font-mono">
              We partner with certified Swiss and international watchmakers to offer authentic, high-end timepieces to collectors across the globe.
            </p>
          </div>

          <div className="relative aspect-video sm:aspect-square bg-black border border-white/10 overflow-hidden">
            <SmoothImage
              src="/images/watches/aurelia_master_classic.jpg"
              alt="Swiss Watchmaking"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-5 space-y-2">
            <div className="text-lg text-[#C5A059]">✦</div>
            <h3 className="text-xs font-bold uppercase text-white tracking-wider">100% Authentic</h3>
            <p className="text-xs text-white/60 font-mono">
              Complete with official factory documentation, certificate of origin, and matching serial numbers.
            </p>
          </div>

          <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-5 space-y-2">
            <div className="text-lg text-[#C5A059]">✦</div>
            <h3 className="text-xs font-bold uppercase text-white tracking-wider">5-Year Warranty</h3>
            <p className="text-xs text-white/60 font-mono">
              Full coverage on movements, complications, and mechanical performance.
            </p>
          </div>

          <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-5 space-y-2">
            <div className="text-lg text-[#C5A059]">✦</div>
            <h3 className="text-xs font-bold uppercase text-white tracking-wider">Insured Delivery</h3>
            <p className="text-xs text-white/60 font-mono">
              Fast, discreet, fully insured air courier shipping to your door.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="text-center py-6 border-t border-[#1a1a1a]">
          <Link
            href="/catalog"
            className="inline-block px-8 py-3 bg-[#C5A059] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#b08d48] transition-colors"
          >
            Explore Watches
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
