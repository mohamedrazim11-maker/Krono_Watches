"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api";
import Link from "next/link";

const PRESET_GALLERY_SETS = [
  {
    name: "Classic Dress",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Steel Chrono",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Diver 300M",
    images: [
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

// Shared styles
const inputSt: React.CSSProperties = {
  width: "100%", background: "#141820", border: "1px solid #1E2530",
  borderRadius: "6px", padding: "8px 11px",
  fontSize: "12px", color: "#E2E8F0", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 150ms",
};
const labelSt: React.CSSProperties = {
  display: "block", fontSize: "10px", fontWeight: 700,
  color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "5px",
};
const sectionSt: React.CSSProperties = {
  background: "#0D1117", border: "1px solid #1E2530",
  borderRadius: "8px", padding: "20px",
};

function LabeledField({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelSt}>{label}{required && <span style={{ color: "#F87171", marginLeft: "2px" }}>*</span>}</label>
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
    brand: "Krono Swiss",
    category: "Luxury",
    gender: "Men",
    case_size: "40mm",
    price: "",
    old_price: "",
    badge: "New Release",
    warranty: "5 Years Certified International Warranty",
    promotion_period: "Active Season Privilege",
    movement: "Swiss Automatic ETA 2824-2",
    case_material: "316L Stainless Steel",
    water_resistance: "100m (10 ATM)",
    stock_count: "10",
    description: "",
    is_featured: false,
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
    if (images.includes(t)) { alert("URL already added."); return; }
    setImages((prev) => [...prev, t]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (idx: number) => {
    if (images.length === 1) { alert("At least one image is required."); return; }
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
      setMessage({ type: "error", text: "Please enter a valid price." });
      setIsSubmitting(false);
      return;
    }
    try {
      await createProduct({
        name: formData.name, brand: formData.brand, category: formData.category,
        gender: formData.gender, case_size: formData.case_size, price: priceNum,
        old_price: oldPriceNum, badge: formData.badge, warranty: formData.warranty,
        promotion_period: formData.promotion_period, image_url: images[0], images,
        movement: formData.movement, case_material: formData.case_material,
        water_resistance: formData.water_resistance, stock_count: stockNum,
        in_stock: stockNum > 0, description: formData.description, is_featured: formData.is_featured,
      });
      setMessage({ type: "success", text: "Product created successfully!" });
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create product." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusStyle = { borderColor: "#3B82F6", boxShadow: "0 0 0 2px rgba(59,130,246,0.15)" };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>
            Catalogue / New
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", margin: 0, letterSpacing: "-0.4px" }}>Add Product</h1>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            Register a new product to the PostgreSQL database.
          </p>
        </div>
        <Link href="/admin/products" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "8px 14px", borderRadius: "6px",
          background: "#141820", border: "1px solid #1E2530", color: "#94A3B8",
          fontSize: "12px", fontWeight: 600, textDecoration: "none",
        }}>
          ← All Products
        </Link>
      </div>

      {/* Status Message */}
      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: "6px", marginBottom: "20px",
          fontSize: "12px", fontWeight: 600,
          background: message.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          borderLeft: `3px solid ${message.type === "success" ? "#22C55E" : "#F87171"}`,
          color: message.type === "success" ? "#22C55E" : "#F87171",
        }}>
          {message.type === "success" ? "✓" : "✕"} {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Section 1: Identity */}
        <div style={sectionSt}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#E2E8F0", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #1E2530", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            1 · Identity & Classification
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <LabeledField label="Product Name" required>
                <input required type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="e.g. Aurelia Precision Tourbillon GMT"
                  style={inputSt}
                  onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                />
              </LabeledField>
            </div>
            <LabeledField label="Brand">
              <input type="text" name="brand" value={formData.brand} onChange={handleChange}
                style={inputSt}
                onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </LabeledField>
            <LabeledField label="Category">
              <select name="category" value={formData.category} onChange={handleChange}
                style={{ ...inputSt, appearance: "none" }}>
                {["Luxury", "Automatic", "Sport", "Smart"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </LabeledField>
            <LabeledField label="Gender">
              <select name="gender" value={formData.gender} onChange={handleChange}
                style={{ ...inputSt, appearance: "none" }}>
                {["Men", "Women", "Unisex"].map((g) => <option key={g}>{g}</option>)}
              </select>
            </LabeledField>
            <LabeledField label="Case Size">
              <input type="text" name="case_size" value={formData.case_size} onChange={handleChange}
                placeholder="41mm" style={inputSt}
                onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </LabeledField>
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div style={sectionSt}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#E2E8F0", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #1E2530", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            2 · Pricing & Stock
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <LabeledField label="Retail Price (LKR)" required>
              <input required type="number" name="price" value={formData.price} onChange={handleChange}
                placeholder="450000" style={{ ...inputSt, fontFamily: "monospace" }}
                onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </LabeledField>
            <LabeledField label="Original Price (LKR)">
              <input type="number" name="old_price" value={formData.old_price} onChange={handleChange}
                placeholder="520000" style={{ ...inputSt, fontFamily: "monospace" }}
                onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </LabeledField>
            <LabeledField label="Stock Count">
              <input type="number" name="stock_count" value={formData.stock_count} onChange={handleChange}
                placeholder="10" style={{ ...inputSt, fontFamily: "monospace" }}
                onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </LabeledField>
            <div style={{ gridColumn: "span 2" }}>
              <LabeledField label="Warranty">
                <input type="text" name="warranty" value={formData.warranty} onChange={handleChange} style={inputSt}
                  onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                />
              </LabeledField>
            </div>
            <LabeledField label="Badge Label">
              <input type="text" name="badge" value={formData.badge} onChange={handleChange}
                placeholder="New Release" style={inputSt}
                onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </LabeledField>
          </div>
        </div>

        {/* Section 3: Specs */}
        <div style={sectionSt}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#E2E8F0", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #1E2530", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            3 · Technical Specifications
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <LabeledField label="Movement / Calibre">
              <input type="text" name="movement" value={formData.movement} onChange={handleChange}
                placeholder="Swiss ETA 2824-2" style={{ ...inputSt, fontFamily: "monospace" }}
                onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </LabeledField>
            <LabeledField label="Case Material">
              <input type="text" name="case_material" value={formData.case_material} onChange={handleChange}
                placeholder="316L Stainless Steel" style={inputSt}
                onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </LabeledField>
            <LabeledField label="Water Resistance">
              <input type="text" name="water_resistance" value={formData.water_resistance} onChange={handleChange}
                placeholder="100m (10 ATM)" style={{ ...inputSt, fontFamily: "monospace" }}
                onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </LabeledField>
            <div style={{ gridColumn: "span 3" }}>
              <LabeledField label="Description">
                <textarea rows={3} name="description" value={formData.description} onChange={handleChange}
                  placeholder="Detailed product description for the storefront..."
                  style={{ ...inputSt, resize: "vertical" }}
                  onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                />
              </LabeledField>
            </div>
            <div style={{ gridColumn: "span 3" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <div
                  onClick={() => setFormData((p) => ({ ...p, is_featured: !p.is_featured }))}
                  style={{
                    width: "36px", height: "20px", borderRadius: "10px", border: "none", cursor: "pointer",
                    background: formData.is_featured ? "#3B82F6" : "#1E2530",
                    position: "relative", transition: "background 200ms", flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: "2px", width: "16px", height: "16px",
                    borderRadius: "50%", background: "white",
                    left: formData.is_featured ? "18px" : "2px",
                    transition: "left 200ms", display: "block",
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#E2E8F0" }}>Featured Product</div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>Pin to the featured section on the homepage</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Images */}
        <div style={sectionSt}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#E2E8F0", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #1E2530", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>4 · Product Images ({images.length})</span>
            <div style={{ display: "flex", gap: "6px" }}>
              {PRESET_GALLERY_SETS.map((set, i) => (
                <button
                  key={i} type="button" onClick={() => setImages(set.images)}
                  style={{
                    padding: "3px 9px", borderRadius: "4px", fontSize: "10px", fontWeight: 600,
                    background: "#141820", border: "1px solid #1E2530", color: "#64748B",
                    cursor: "pointer", transition: "color 120ms",
                  }}
                >
                  Load {set.name}
                </button>
              ))}
            </div>
          </div>

          {/* Add URL */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste image URL (Unsplash, CDN, etc.)..."
              style={{ ...inputSt, flex: 1 }}
              onFocus={(e) => Object.assign((e.target as HTMLElement).style, focusStyle)}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#1E2530"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddImage())}
            />
            <button type="button" onClick={handleAddImage}
              style={{
                padding: "8px 16px", borderRadius: "6px", border: "none",
                background: "#3B82F6", color: "white", fontSize: "12px", fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}>
              Add URL
            </button>
          </div>

          {/* Preview Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ position: "relative", borderRadius: "6px", overflow: "hidden", border: "1px solid #1E2530", height: "100px", background: "#141820" }}>
                <img src={img} alt={`img-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                {idx === 0 && (
                  <span style={{
                    position: "absolute", top: "5px", left: "5px",
                    background: "#3B82F6", color: "white",
                    fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "3px", textTransform: "uppercase",
                  }}>Cover</span>
                )}
                <button type="button" onClick={() => handleRemoveImage(idx)}
                  style={{
                    position: "absolute", top: "5px", right: "5px",
                    background: "rgba(0,0,0,0.7)", border: "none", color: "#F87171",
                    width: "20px", height: "20px", borderRadius: "4px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px",
                  }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={isSubmitting}
          style={{
            width: "100%", padding: "12px", borderRadius: "6px", border: "none",
            background: isSubmitting ? "#1D4ED8" : "#3B82F6",
            color: "white", fontSize: "13px", fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            letterSpacing: "0.03em", transition: "background 150ms",
          }}>
          {isSubmitting ? "Creating product..." : "Create Product →"}
        </button>
      </form>

      <style jsx global>{`
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder, textarea::placeholder { color: #475569; }
        select option { background: #141820; color: #E2E8F0; }
      `}</style>
    </div>
  );
}