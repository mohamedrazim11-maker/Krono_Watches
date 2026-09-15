"use client";

import { useEffect, useState } from "react";
import { fetchPosters, updatePoster, Poster } from "@/lib/api";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#141820", border: "1px solid #1E2530",
  borderRadius: "6px", padding: "8px 12px",
  fontSize: "12px", color: "#E2E8F0", outline: "none",
  boxSizing: "border-box", transition: "border-color 150ms",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "10px", fontWeight: 700,
  color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em",
  marginBottom: "5px",
};

const cardStyle: React.CSSProperties = {
  background: "#0D1117", border: "1px solid #1E2530",
  borderRadius: "8px", overflow: "hidden",
};

function Field({
  label, value, onChange, type = "text", rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const focusStyle = focused ? { borderColor: "#3B82F6", boxShadow: "0 0 0 2px rgba(59,130,246,0.15)" } : {};

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputStyle, ...focusStyle, resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputStyle, ...focusStyle }}
        />
      )}
    </div>
  );
}

export default function AdminPromotionsPage() {
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [savingSale, setSavingSale] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [heroData, setHeroData] = useState<Partial<Poster>>({
    section_id: "hero_drop",
    badge: "2026 Season Collection",
    title: "Mastery in horology. Crafted for eternity.",
    subtitle: "Discover master-crafted Swiss mechanical wristwatches designed for visionaries.",
    featured_product_name: "Aurelia Master Classic",
    featured_product_price: "LKR 385,000",
    discount_text: "Save 30% Today",
    image_url: "",
    is_active: true,
  });

  const [saleData, setSaleData] = useState<Partial<Poster>>({
    section_id: "weekend_sale",
    badge: "Exclusive Flash Promotion",
    title: "Up to 50% off iconic luxury timepieces.",
    subtitle: "Limited-edition collectors pieces with verified international warranty.",
    coupon_code: "FLASH50",
    discount_text: "Up to 50% OFF",
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const posters = await fetchPosters();
        const hero = posters.find((p) => p.section_id === "hero_drop" || p.section_id === "hero");
        if (hero) setHeroData(hero);
        const sale = posters.find((p) => p.section_id === "weekend_sale" || p.section_id === "flash_deals");
        if (sale) setSaleData(sale);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHero(true);
    try {
      await updatePoster(heroData);
      showToast("Hero banner published successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to publish hero banner.", "error");
    } finally { setSavingHero(false); }
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSale(true);
    try {
      await updatePoster(saleData);
      showToast("Campaign published successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to publish campaign.", "error");
    } finally { setSavingSale(false); }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", fontFamily: "inherit" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "28px", zIndex: 9999,
          background: "#0D1117",
          border: `1px solid ${toast.type === "success" ? "#22C55E" : "#F87171"}`,
          borderLeft: `3px solid ${toast.type === "success" ? "#22C55E" : "#F87171"}`,
          borderRadius: "6px", padding: "12px 18px",
          fontSize: "12px", fontWeight: 600,
          color: toast.type === "success" ? "#22C55E" : "#F87171",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)", animation: "slideUp 0.2s ease",
        }}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>
          Marketing
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", margin: 0, letterSpacing: "-0.4px" }}>
          Campaigns & Banners
        </h1>
        <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
          Control hero showcase, promotional banners, voucher codes, and discount events.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ ...cardStyle, height: "420px", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* Hero Banner Card */}
          <div style={cardStyle}>
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #1E2530",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#E2E8F0" }}>Hero Banner</div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Main storefront showcase section</div>
              </div>
              <span style={{
                padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                background: "rgba(59,130,246,0.12)", color: "#60A5FA",
                border: "1px solid rgba(59,130,246,0.25)", fontFamily: "monospace",
              }}>
                hero_drop
              </span>
            </div>

            <form onSubmit={handleSaveHero} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field label="Badge Text" value={heroData.badge || ""} onChange={(v) => setHeroData({ ...heroData, badge: v })} />
              <Field label="Headline" value={heroData.title || ""} onChange={(v) => setHeroData({ ...heroData, title: v })} />
              <Field label="Subtitle" value={heroData.subtitle || ""} onChange={(v) => setHeroData({ ...heroData, subtitle: v })} rows={2} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="Featured Product" value={heroData.featured_product_name || ""} onChange={(v) => setHeroData({ ...heroData, featured_product_name: v })} />
                <Field label="Price Display" value={heroData.featured_product_price || ""} onChange={(v) => setHeroData({ ...heroData, featured_product_price: v })} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="Discount Tag" value={heroData.discount_text || ""} onChange={(v) => setHeroData({ ...heroData, discount_text: v })} />
                <Field label="Coupon Code" value={heroData.coupon_code || ""} onChange={(v) => setHeroData({ ...heroData, coupon_code: v })} />
              </div>

              <Field label="Background Image URL" type="url" value={heroData.image_url || ""} onChange={(v) => setHeroData({ ...heroData, image_url: v })} />

              {/* Active toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#141820", borderRadius: "6px", border: "1px solid #1E2530" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#E2E8F0" }}>Active</div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>Show this banner on storefront</div>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroData({ ...heroData, is_active: !heroData.is_active })}
                  style={{
                    width: "36px", height: "20px", borderRadius: "10px", border: "none", cursor: "pointer",
                    background: heroData.is_active ? "#3B82F6" : "#1E2530",
                    position: "relative", transition: "background 200ms",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: "2px", width: "16px", height: "16px",
                    borderRadius: "50%", background: "white",
                    left: heroData.is_active ? "18px" : "2px",
                    transition: "left 200ms", display: "block",
                  }} />
                </button>
              </div>

              <button
                type="submit"
                disabled={savingHero}
                style={{
                  width: "100%", padding: "10px", borderRadius: "6px", border: "none",
                  background: savingHero ? "#1D4ED8" : "#3B82F6",
                  color: "white", fontSize: "12px", fontWeight: 700,
                  cursor: savingHero ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  transition: "background 150ms",
                  letterSpacing: "0.02em",
                }}
              >
                {savingHero ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                      style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                    </svg>
                    Publishing...
                  </>
                ) : "Publish Hero Changes"}
              </button>
            </form>
          </div>

          {/* Flash Sale / Campaign Card */}
          <div style={cardStyle}>
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #1E2530",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#E2E8F0" }}>Flash Campaign</div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Promotional banner with voucher code</div>
              </div>
              <span style={{
                padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                background: "rgba(249,115,22,0.12)", color: "#FB923C",
                border: "1px solid rgba(249,115,22,0.25)", fontFamily: "monospace",
              }}>
                weekend_sale
              </span>
            </div>

            <form onSubmit={handleSaveSale} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field label="Badge Text" value={saleData.badge || ""} onChange={(v) => setSaleData({ ...saleData, badge: v })} />
              <Field label="Headline" value={saleData.title || ""} onChange={(v) => setSaleData({ ...saleData, title: v })} />
              <Field label="Subtitle" value={saleData.subtitle || ""} onChange={(v) => setSaleData({ ...saleData, subtitle: v })} rows={2} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Voucher Code</label>
                  <input
                    type="text"
                    value={saleData.coupon_code || ""}
                    onChange={(e) => setSaleData({ ...saleData, coupon_code: e.target.value })}
                    style={{ ...inputStyle, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#3B82F6"; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; }}
                  />
                </div>
                <Field label="Discount Tag" value={saleData.discount_text || ""} onChange={(v) => setSaleData({ ...saleData, discount_text: v })} />
              </div>

              <Field label="Promotion Period" value={saleData.promotion_period || ""} onChange={(v) => setSaleData({ ...saleData, promotion_period: v })} />
              <Field label="Background Image URL" type="url" value={saleData.image_url || ""} onChange={(v) => setSaleData({ ...saleData, image_url: v })} />

              {/* Active toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#141820", borderRadius: "6px", border: "1px solid #1E2530" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#E2E8F0" }}>Active</div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>Show this campaign on storefront</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSaleData({ ...saleData, is_active: !saleData.is_active })}
                  style={{
                    width: "36px", height: "20px", borderRadius: "10px", border: "none", cursor: "pointer",
                    background: saleData.is_active ? "#3B82F6" : "#1E2530",
                    position: "relative", transition: "background 200ms",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: "2px", width: "16px", height: "16px",
                    borderRadius: "50%", background: "white",
                    left: saleData.is_active ? "18px" : "2px",
                    transition: "left 200ms", display: "block",
                  }} />
                </button>
              </div>

              <button
                type="submit"
                disabled={savingSale}
                style={{
                  width: "100%", padding: "10px", borderRadius: "6px", border: "none",
                  background: savingSale ? "#1D4ED8" : "#3B82F6",
                  color: "white", fontSize: "12px", fontWeight: 700,
                  cursor: savingSale ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  transition: "background 150ms", letterSpacing: "0.02em",
                }}
              >
                {savingSale ? "Publishing..." : "Publish Campaign Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        textarea::placeholder, input::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}
