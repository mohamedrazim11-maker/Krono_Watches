"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPosters, updatePoster, Poster } from "@/lib/api";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#141414",
  border: "1px solid #222222",
  borderRadius: "6px",
  padding: "9px 12px",
  fontSize: "12px",
  color: "#F8FAFC",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 150ms",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 700,
  color: "#71717A",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "5px",
};

const cardStyle: React.CSSProperties = {
  background: "#0D0D0D",
  border: "1px solid #1E1E1E",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const focusStyle = focused ? { borderColor: "#52525B", boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.08)" } : {};

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
    title: "Mastery in watchmaking. Crafted for eternity.",
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
    title: "Up to 50% off iconic luxury watches.",
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
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
      showToast("Storefront hero banner published successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to publish hero banner.", "error");
    } finally {
      setSavingHero(false);
    }
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSale(true);
    try {
      await updatePoster(saleData);
      showToast("Storefront flash sale published successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to publish flash sale.", "error");
    } finally {
      setSavingSale(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", fontFamily: "inherit" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "32px",
            zIndex: 9999,
            background: "#141414",
            border: "1px solid #27272A",
            borderLeft: `4px solid ${toast.type === "success" ? "#34D399" : "#F87171"}`,
            borderRadius: "8px",
            padding: "14px 20px",
            fontSize: "12.5px",
            fontWeight: 600,
            color: toast.type === "success" ? "#F8FAFC" : "#F87171",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "5px" }}>
            Storefront Marketing & Drops
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#F8FAFC",
              margin: 0,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              letterSpacing: "0.02em",
            }}
          >
            Storefront Promotional Campaigns
          </h1>
          <p style={{ fontSize: "12.5px", color: "#71717A", marginTop: "4px" }}>
            Control hero drops, promotional banners, checkout coupon vouchers, and flash discounts in real-time.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "6px",
            background: "#141414",
            border: "1px solid #27272A",
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <span>Inspect Live Storefront ↗</span>
        </Link>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ ...cardStyle, height: "460px", opacity: 0.5 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Hero Banner Card */}
          <div style={cardStyle}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #1E1E1E",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#121212",
              }}
            >
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#F8FAFC" }}>
                  1 · Primary Storefront Hero Drop
                </div>
                <div style={{ fontSize: "11px", color: "#71717A" }}>
                  Controls the main hero banner atop the Krono homepage
                </div>
              </div>
              <span
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  background: heroData.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.12)",
                  color: heroData.is_active ? "#34D399" : "#F87171",
                  border: `1px solid ${heroData.is_active ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.25)"}`,
                }}
              >
                {heroData.is_active ? "Live on Store" : "Paused"}
              </span>
            </div>

            {/* Live Storefront Preview Box */}
            <div
              style={{
                margin: "16px 20px 0 20px",
                padding: "16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #141414 0%, #0A0A0A 100%)",
                border: "1px solid #222222",
              }}
            >
              <div style={{ fontSize: "9px", color: "#71717A", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                LIVE STOREFRONT PREVIEW
              </div>
              <div style={{ fontSize: "11px", color: "#A1A1AA", fontWeight: 600, marginTop: "6px" }}>
                {heroData.badge || "2026 Collection"}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", fontFamily: "'Cormorant Garamond', Georgia, serif", marginTop: "2px" }}>
                {heroData.title || "Mastery in watchmaking."}
              </div>
              <div style={{ fontSize: "11px", color: "#71717A", marginTop: "4px" }}>
                {heroData.subtitle}
              </div>
              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#FFFFFF" }}>
                  {heroData.featured_product_name}: {heroData.featured_product_price}
                </span>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "#FFFFFF", color: "#000000", fontWeight: 700 }}>
                  {heroData.discount_text}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveHero} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field
                label="Campaign Eyebrow Badge"
                value={heroData.badge || ""}
                onChange={(v) => setHeroData({ ...heroData, badge: v })}
              />
              <Field
                label="Headline Title"
                value={heroData.title || ""}
                onChange={(v) => setHeroData({ ...heroData, title: v })}
              />
              <Field
                label="Subtitle Description"
                value={heroData.subtitle || ""}
                onChange={(v) => setHeroData({ ...heroData, subtitle: v })}
                rows={2}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field
                  label="Featured Watch Name"
                  value={heroData.featured_product_name || ""}
                  onChange={(v) => setHeroData({ ...heroData, featured_product_name: v })}
                />
                <Field
                  label="Display Price"
                  value={heroData.featured_product_price || ""}
                  onChange={(v) => setHeroData({ ...heroData, featured_product_price: v })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field
                  label="Incentive Tag"
                  value={heroData.discount_text || ""}
                  onChange={(v) => setHeroData({ ...heroData, discount_text: v })}
                />
                <Field
                  label="Hero Image URL (Optional)"
                  value={heroData.image_url || ""}
                  onChange={(v) => setHeroData({ ...heroData, image_url: v })}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={heroData.is_active !== false}
                    onChange={(e) => setHeroData({ ...heroData, is_active: e.target.checked })}
                    style={{ width: "16px", height: "16px", accentColor: "#FFFFFF" }}
                  />
                  <span style={{ fontSize: "12px", color: "#F8FAFC", fontWeight: 600 }}>Active on Storefront</span>
                </label>

                <button
                  type="submit"
                  disabled={savingHero}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "6px",
                    background: "#FFFFFF",
                    color: "#050505",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    border: "none",
                    boxShadow: "0 2px 10px rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {savingHero ? "Publishing..." : "Publish Hero Changes ↗"}
                </button>
              </div>
            </form>
          </div>

          {/* Flash Sale / Coupon Voucher Card */}
          <div style={cardStyle}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #1E1E1E",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#121212",
              }}
            >
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#F8FAFC" }}>
                  2 · Flash Promotion & Checkout Coupon
                </div>
                <div style={{ fontSize: "11px", color: "#71717A" }}>
                  Controls promotional ticker and discount code recognized at checkout
                </div>
              </div>
              <span
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  background: saleData.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.12)",
                  color: saleData.is_active ? "#34D399" : "#F87171",
                  border: `1px solid ${saleData.is_active ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.25)"}`,
                }}
              >
                {saleData.is_active ? "Live on Store" : "Paused"}
              </span>
            </div>

            {/* Live Storefront Preview Box */}
            <div
              style={{
                margin: "16px 20px 0 20px",
                padding: "16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #141414 0%, #0A0A0A 100%)",
                border: "1px solid #222222",
              }}
            >
              <div style={{ fontSize: "9px", color: "#71717A", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                STOREFRONT CHECKOUT VOUCHER PREVIEW
              </div>
              <div style={{ fontSize: "11px", color: "#34D399", fontWeight: 700, marginTop: "6px" }}>
                {saleData.badge || "Flash Promotion"}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", fontFamily: "'Cormorant Garamond', Georgia, serif", marginTop: "2px" }}>
                {saleData.title || "Limited Edition Flash Sale"}
              </div>
              <div style={{ fontSize: "11px", color: "#71717A", marginTop: "4px" }}>
                {saleData.subtitle}
              </div>
              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "11px", color: "#71717A" }}>COUPON CODE:</span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#FFFFFF", fontFamily: "monospace", padding: "2px 8px", background: "#181818", borderRadius: "4px", border: "1px dashed #52525B" }}>
                  {saleData.coupon_code || "KRONO2026"}
                </span>
                <span style={{ fontSize: "11px", color: "#34D399", fontWeight: 600 }}>
                  ({saleData.discount_text || "Special Privilege"})
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveSale} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field
                label="Promotion Eyebrow Badge"
                value={saleData.badge || ""}
                onChange={(v) => setSaleData({ ...saleData, badge: v })}
              />
              <Field
                label="Headline Title"
                value={saleData.title || ""}
                onChange={(v) => setSaleData({ ...saleData, title: v })}
              />
              <Field
                label="Subtitle Description"
                value={saleData.subtitle || ""}
                onChange={(v) => setSaleData({ ...saleData, subtitle: v })}
                rows={2}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field
                  label="Checkout Coupon Code"
                  value={saleData.coupon_code || ""}
                  onChange={(v) => setSaleData({ ...saleData, coupon_code: v.toUpperCase() })}
                />
                <Field
                  label="Discount Value Text"
                  value={saleData.discount_text || ""}
                  onChange={(v) => setSaleData({ ...saleData, discount_text: v })}
                />
              </div>

              <Field
                label="Promotion Banner Image URL (Optional)"
                value={saleData.image_url || ""}
                onChange={(v) => setSaleData({ ...saleData, image_url: v })}
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={saleData.is_active !== false}
                    onChange={(e) => setSaleData({ ...saleData, is_active: e.target.checked })}
                    style={{ width: "16px", height: "16px", accentColor: "#FFFFFF" }}
                  />
                  <span style={{ fontSize: "12px", color: "#F8FAFC", fontWeight: 600 }}>Active on Storefront</span>
                </label>

                <button
                  type="submit"
                  disabled={savingSale}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "6px",
                    background: "#FFFFFF",
                    border: "none",
                    color: "#050505",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {savingSale ? "Publishing..." : "Publish Campaign Changes ↗"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
