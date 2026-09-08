"use client";

import { useEffect, useState } from "react";
import { fetchPosters, updatePoster, Poster } from "@/lib/api";

export default function AdminPromotionsPage() {
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [savingSale, setSavingSale] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [heroData, setHeroData] = useState<Partial<Poster>>({
    section_id: "hero",
    badge: "2026 Atelier Collection",
    title: "Mastery in Every Calibre.",
    subtitle: "Immerse yourself in precision horology. Certified Swiss ETA calibres, scratch-resistant sapphire crystals, and guaranteed 5-year global concierge warranty.",
    featured_product_name: "Krono Royal Sovereign ETA 2824-2",
    featured_product_price: "LKR 485,000",
    discount_text: "Exclusive Release",
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80",
    is_active: true,
  });

  const [saleData, setSaleData] = useState<Partial<Poster>>({
    section_id: "flash_deals",
    badge: "VIP Privilege Event",
    title: "Exclusive 20% Masterpiece Privilege",
    subtitle: "Unlock private boutique pricing across our certified ETA calibres and grand complications. Complimentary insured courier included.",
    coupon_code: "MONO20",
    discount_text: "20% OFF",
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80",
    is_active: true,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const posters = await fetchPosters();
        const hero = posters.find((p) => p.section_id === "hero" || p.section_id === "hero_drop");
        if (hero) setHeroData(hero);

        const sale = posters.find((p) => p.section_id === "flash_deals" || p.section_id === "weekend_sale");
        if (sale) setSaleData(sale);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHero(true);
    try {
      await updatePoster(heroData);
      setToastMessage("Hero Banner updated and synced with storefront!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update hero banner");
    } finally {
      setSavingHero(false);
    }
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSale(true);
    try {
      await updatePoster(saleData);
      setToastMessage("VIP Campaign updated successfully!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update campaign");
    } finally {
      setSavingSale(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Campaigns</span>
        <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight mt-1">Promotions & Store Banners</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Control hero showcase, VIP deals, voucher codes, and promotional photography.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-xs font-mono font-semibold flex items-center justify-between">
          <span>✓ {toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-64 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 animate-pulse shadow-sm"></div>
          <div className="h-64 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 animate-pulse shadow-sm"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 bg-white dark:bg-[#131B2A] shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">Main Hero Showcase</h2>
              <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded font-bold">
                hero
              </span>
            </div>

            <form onSubmit={handleSaveHero} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Badge</label>
                <input
                  type="text"
                  value={heroData.badge || ""}
                  onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Title</label>
                <input
                  type="text"
                  value={heroData.title || ""}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Subtitle</label>
                <textarea
                  rows={2}
                  value={heroData.subtitle || ""}
                  onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Watch Name</label>
                  <input
                    type="text"
                    value={heroData.featured_product_name || ""}
                    onChange={(e) => setHeroData({ ...heroData, featured_product_name: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Valuation</label>
                  <input
                    type="text"
                    value={heroData.featured_product_price || ""}
                    onChange={(e) => setHeroData({ ...heroData, featured_product_price: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Image URL</label>
                <input
                  type="url"
                  value={heroData.image_url || ""}
                  onChange={(e) => setHeroData({ ...heroData, image_url: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingHero}
                className="w-full lux-btn-primary py-3 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer shadow-md"
              >
                {savingHero ? "Publishing..." : "Publish Hero Changes"}
              </button>
            </form>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 bg-white dark:bg-[#131B2A] shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">Privilege Campaign & Voucher</h2>
              <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded font-bold">
                flash_deals
              </span>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Badge</label>
                <input
                  type="text"
                  value={saleData.badge || ""}
                  onChange={(e) => setSaleData({ ...saleData, badge: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Headline</label>
                <input
                  type="text"
                  value={saleData.title || ""}
                  onChange={(e) => setSaleData({ ...saleData, title: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Voucher Code</label>
                  <input
                    type="text"
                    value={saleData.coupon_code || ""}
                    onChange={(e) => setSaleData({ ...saleData, coupon_code: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono uppercase font-bold border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Discount Tag</label>
                  <input
                    type="text"
                    value={saleData.discount_text || ""}
                    onChange={(e) => setSaleData({ ...saleData, discount_text: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase font-bold block mb-1">Image URL</label>
                <input
                  type="url"
                  value={saleData.image_url || ""}
                  onChange={(e) => setSaleData({ ...saleData, image_url: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingSale}
                className="w-full lux-btn-primary py-3 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer shadow-md"
              >
                {savingSale ? "Publishing..." : "Publish Campaign Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
