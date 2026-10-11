"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api";
import Link from "next/link";

const PRESET_GALLERY_SETS = [
  {
    name: "Classic Dress & Leather",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Steel Chronograph",
    images: [
      "/images/watches/seastar_1000_powermatic.jpg",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Diver 300M / Cerachrom",
    images: [
      "/images/watches/submariner_deep_black_ceramic.jpg",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const inputSt: React.CSSProperties = {
  width: "100%",
  background: "var(--card-elevated, #162923)",
  border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "12px",
  color: "var(--foreground, #F8FAFC)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 150ms",
};

const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 700,
  color: "var(--accent-muted, #8EAA9C)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "5px",
};

const sectionSt: React.CSSProperties = {
  background: "var(--card, #12221D)",
  border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
  borderRadius: "14px",
  padding: "24px",
  boxShadow: "var(--neu-shadow-raised-sm, 4px 4px 10px rgba(0,0,0,0.7))",
};

function LabeledField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelSt}>
        {label}
        {required && <span style={{ color: "#F87171", marginLeft: "2px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function UploadProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    brand: "Rolex",
    category: "Luxury",
    gender: "Men",
    case_size: "40mm",
    price: "",
    old_price: "",
    badge: "VIP Allocation",
    warranty: "5 Years Certified International Guarantee",
    promotion_period: "Active Season Privilege",
    movement: "Rolex Perpetual Calibre 3235 Automatic",
    case_material: "Oystersteel (904L)",
    water_resistance: "300m (30 ATM)",
    stock_count: "5",
    description: "",
    is_featured: true,
  });

  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddImage = () => {
    const t = newImageUrl.trim();
    if (!t) return;
    if (images.includes(t)) {
      alert("URL already added.");
      return;
    }
    setImages((prev) => [...prev, t]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (idx: number) => {
    if (images.length === 1) {
      alert("At least one timepiece image is required.");
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    const priceNum = parseFloat(formData.price);
    const oldPriceNum = formData.old_price ? parseFloat(formData.old_price) : undefined;
    const stockNum = parseInt(formData.stock_count, 10) || 0;
    if (isNaN(priceNum) || priceNum <= 0) {
      setMessage({ type: "error", text: "Please enter a valid retail price (LKR)." });
      setIsSubmitting(false);
      return;
    }
    try {
      await createProduct({
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        gender: formData.gender,
        case_size: formData.case_size,
        price: priceNum,
        old_price: oldPriceNum,
        badge: formData.badge,
        warranty: formData.warranty,
        promotion_period: formData.promotion_period,
        image_url: images[0],
        images,
        movement: formData.movement,
        case_material: formData.case_material,
        water_resistance: formData.water_resistance,
        stock_count: stockNum,
        in_stock: stockNum > 0,
        description: formData.description,
        is_featured: formData.is_featured,
      });
      setMessage({ type: "success", text: "Timepiece registered successfully in vault and live on storefront!" });
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create timepiece." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusStyle = { borderColor: "var(--rolex-gold, #C5A059)", boxShadow: "0 0 0 2px var(--gold-glow, rgba(197, 160, 89, 0.28))" };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--rolex-gold, #C5A059)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "5px" }}>
            Catalogue / Acquisition
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "var(--foreground, #F8FAFC)",
              margin: 0,
              fontFamily: "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
              letterSpacing: "0.02em",
            }}
          >
            Register Certified Timepiece
          </h1>
          <p style={{ fontSize: "12.5px", color: "var(--accent-muted, #8EAA9C)", marginTop: "4px" }}>
            Add an authentic Swiss or international luxury horological model to the storefront inventory.
          </p>
        </div>
        <Link
          href="/admin/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 16px",
            borderRadius: "8px",
            background: "var(--card-elevated, #162923)",
            border: "1px solid var(--border-strong, rgba(0, 163, 98, 0.35))",
            color: "var(--rolex-gold, #C5A059)",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Return to Vault Catalogue
        </Link>
      </div>

      {/* Status Message */}
      {message && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "12.5px",
            fontWeight: 600,
            background: message.type === "success" ? "rgba(0, 163, 98, 0.15)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${message.type === "success" ? "var(--accent, #00A362)" : "rgba(239, 68, 68, 0.4)"}`,
            borderLeft: `4px solid ${message.type === "success" ? "var(--accent, #00A362)" : "#F87171"}`,
            color: message.type === "success" ? "var(--accent, #00A362)" : "#F87171",
          }}
        >
          {message.type === "success" ? "✓" : "✕"} {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Section 1: Horological Identity */}
        <div style={sectionSt}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--rolex-gold, #C5A059)",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            1 · Horological Identity & Classification
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <LabeledField label="Timepiece Model Name" required>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rolex Cosmograph Daytona 40mm Cerachrom"
                  style={inputSt}
                  onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                  onBlur={(e) => {
                    (e.target as HTMLElement).style.borderColor = "var(--border-subtle, rgba(0, 96, 57, 0.25))";
                    (e.target as HTMLElement).style.boxShadow = "none";
                  }}
                />
              </LabeledField>
            </div>

            <LabeledField label="Maison / Brand">
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                style={inputSt}
              >
                {["Rolex", "Omega", "Patek Philippe", "Audemars Piguet", "Cartier", "Krono Swiss", "Tissot", "Breitling"].map((b) => (
                  <option key={b} value={b} style={{ background: "var(--card-elevated, #162923)", color: "#FFF" }}>
                    {b}
                  </option>
                ))}
              </select>
            </LabeledField>

            <LabeledField label="Horological Category">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={inputSt}
              >
                {["Luxury", "Dive Watches", "Chronograph", "Automatic", "Sports Watches", "Dress Watches"].map((c) => (
                  <option key={c} value={c} style={{ background: "var(--card-elevated, #162923)", color: "#FFF" }}>
                    {c}
                  </option>
                ))}
              </select>
            </LabeledField>

            <LabeledField label="Gender / Allocation">
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputSt}>
                <option value="Men" style={{ background: "var(--card-elevated, #162923)", color: "#FFF" }}>Men's Horology</option>
                <option value="Women" style={{ background: "var(--card-elevated, #162923)", color: "#FFF" }}>Women's Horology</option>
                <option value="Unisex" style={{ background: "var(--card-elevated, #162923)", color: "#FFF" }}>Unisex</option>
              </select>
            </LabeledField>

            <LabeledField label="Storefront Promotional Badge">
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="e.g. VIP Allocation, Master Chronometer, New Release"
                style={inputSt}
              />
            </LabeledField>
          </div>
        </div>

        {/* Section 2: Technical Specifications & Calibre */}
        <div style={sectionSt}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--rolex-gold, #C5A059)",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            2 · Technical Specifications & Movement
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <LabeledField label="Movement / Calibre">
              <input
                type="text"
                name="movement"
                value={formData.movement}
                onChange={handleChange}
                placeholder="e.g. Swiss Automatic ETA 2824-2, Rolex Calibre 3235"
                style={inputSt}
              />
            </LabeledField>

            <LabeledField label="Case Material">
              <input
                type="text"
                name="case_material"
                value={formData.case_material}
                onChange={handleChange}
                placeholder="e.g. Oystersteel 904L, 18K Rose Gold, Grade 5 Titanium"
                style={inputSt}
              />
            </LabeledField>

            <LabeledField label="Case Diameter / Size">
              <input
                type="text"
                name="case_size"
                value={formData.case_size}
                onChange={handleChange}
                placeholder="e.g. 40mm, 41mm, 42mm"
                style={inputSt}
              />
            </LabeledField>

            <LabeledField label="Water Resistance">
              <input
                type="text"
                name="water_resistance"
                value={formData.water_resistance}
                onChange={handleChange}
                placeholder="e.g. 300m (30 ATM), 100m (10 ATM)"
                style={inputSt}
              />
            </LabeledField>

            <div style={{ gridColumn: "span 2" }}>
              <LabeledField label="Certified Warranty">
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  placeholder="e.g. 5 Years Certified International Manufacturer Guarantee"
                  style={inputSt}
                />
              </LabeledField>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <LabeledField label="Horological Description">
                <textarea
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide historical context, movement specifications, sapphire crystal details, and strap finishing..."
                  style={{ ...inputSt, resize: "vertical" }}
                />
              </LabeledField>
            </div>
          </div>
        </div>

        {/* Section 3: Commercials & Storefront Showcase */}
        <div style={sectionSt}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--rolex-gold, #C5A059)",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            3 · Valuation, Stock & Storefront Placement
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <LabeledField label="Retail Price (LKR)" required>
              <input
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 3850000"
                style={inputSt}
              />
            </LabeledField>

            <LabeledField label="Original Price (LKR) Optional">
              <input
                type="number"
                name="old_price"
                value={formData.old_price}
                onChange={handleChange}
                placeholder="e.g. 4200000"
                style={inputSt}
              />
            </LabeledField>

            <LabeledField label="Vault Stock Units">
              <input
                type="number"
                name="stock_count"
                value={formData.stock_count}
                onChange={handleChange}
                placeholder="e.g. 5"
                style={inputSt}
              />
            </LabeledField>

            <div style={{ gridColumn: "span 3", marginTop: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", accentColor: "var(--rolex-gold, #C5A059)" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground, #F8FAFC)" }}>
                  Feature prominently on Storefront Homepage ("Curated Masterpieces" Hero Carousel)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Imagery */}
        <div style={sectionSt}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--rolex-gold, #C5A059)",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            4 · High-Resolution Photography
          </div>

          {/* Quick Presets */}
          <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "var(--accent-muted, #8EAA9C)" }}>Use Horological Presets:</span>
            {PRESET_GALLERY_SETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setImages(preset.images)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  background: "rgba(197, 160, 89, 0.15)",
                  border: "1px solid var(--rolex-gold, #C5A059)",
                  color: "var(--rolex-gold, #C5A059)",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Add custom URL */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Paste watch image URL (/images/watches/... or https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              style={{ ...inputSt, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleAddImage}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                background: "linear-gradient(145deg, #007345 0%, #004D2E 100%)",
                border: "1px solid var(--border-strong, rgba(0, 163, 98, 0.35))",
                color: "white",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Add Photo
            </button>
          </div>

          {/* Image Previews */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {images.map((img, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  width: "92px",
                  height: "92px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: i === 0 ? "2px solid var(--rolex-gold, #C5A059)" : "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                  boxShadow: i === 0 ? "0 0 12px var(--gold-glow, rgba(197, 160, 89, 0.28))" : "none",
                }}
              >
                <img src={img} alt={`Preview ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {i === 0 && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      left: "2px",
                      right: "2px",
                      textAlign: "center",
                      background: "rgba(0,0,0,0.85)",
                      color: "var(--rolex-gold, #C5A059)",
                      fontSize: "9px",
                      fontWeight: 800,
                      borderRadius: "3px",
                    }}
                  >
                    PRIMARY
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "3px",
                    background: "rgba(0,0,0,0.85)",
                    color: "#F87171",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
          <Link
            href="/admin/products"
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              background: "var(--card-elevated, #162923)",
              border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
              color: "var(--accent-muted, #8EAA9C)",
              fontSize: "12.5px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "11px 32px",
              borderRadius: "8px",
              background: "linear-gradient(145deg, #F0CF8B 0%, #B88E33 100%)",
              color: "#08110D",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 4px 18px rgba(197, 160, 89, 0.35)",
            }}
          >
            {isSubmitting ? "Registering in Vault..." : "Publish Timepiece to Storefront ↗"}
          </button>
        </div>
      </form>
    </div>
  );
}