"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api";
import Link from "next/link";

const PRESET_GALLERY_SETS = [
  {
    name: "Classic Dress & Leather",
    images: [
      "/images/watches/watch_1547996160-81dfa.jpg",
      "/images/watches/watch_1524592094714-0f.jpg",
    ],
  },
  {
    name: "Steel Chronograph",
    images: [
      "/images/watches/seastar_1000_powermatic.jpg",
      "/images/watches/watch_1542496658-e33a6.jpg",
    ],
  },
  {
    name: "Diver 300M / Cerachrom",
    images: [
      "/images/watches/submariner_deep_black_ceramic.jpg",
      "/images/watches/watch_1434056886845-da.jpg",
    ],
  },
];

const inputSt: React.CSSProperties = {
  width: "100%",
  background: "#141414",
  border: "1px solid #222222",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "12px",
  color: "#F8FAFC",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 150ms",
};

const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 700,
  color: "#71717A",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "5px",
};

const sectionSt: React.CSSProperties = {
  background: "#0D0D0D",
  border: "1px solid #1E1E1E",
  borderRadius: "14px",
  padding: "24px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
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
    "/images/watches/watch_1547996160-81dfa.jpg",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        try {
          const data = new FormData();
          data.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: data,
          });
          const resJson = await res.json();
          if (res.ok && resJson.success && resJson.url) {
            uploadedUrls.push(resJson.url);
            continue;
          }
        } catch (uploadErr) {
          console.warn("Direct upload fallback to base64:", uploadErr);
        }

        // Fallback: Read as Base64 data URL
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        uploadedUrls.push(base64);
      }

      setImages((prev) => {
        const isDefaultOnly =
          prev.length === 1 && prev[0] === "/images/watches/watch_1547996160-81dfa.jpg";
        const base = isDefaultOnly ? [] : prev;
        const combined = [...base, ...uploadedUrls];
        return Array.from(new Set(combined));
      });
    } catch (err: any) {
      alert("Error uploading image: " + (err.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImage = () => {
    const t = newImageUrl.trim();
    if (!t) return;
    if (images.includes(t)) {
      alert("URL already added.");
      return;
    }
    setImages((prev) => {
      const isDefaultOnly =
        prev.length === 1 && prev[0] === "/images/watches/watch_1547996160-81dfa.jpg";
      const base = isDefaultOnly ? [] : prev;
      return [...base, t];
    });
    setNewImageUrl("");
  };

  const handleSetPrimary = (idx: number) => {
    if (idx === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [selected] = next.splice(idx, 1);
      return [selected, ...next];
    });
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (images.length === 0) {
      setMessage({ type: "error", text: "Please add or upload at least one watch image." });
      setIsSubmitting(false);
      return;
    }

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
      setMessage({ type: "success", text: "Watch added successfully to the catalog!" });
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add watch." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusStyle = { borderColor: "#52525B", boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.08)" };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "5px" }}>
            Products / Add New
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#F8FAFC",
              margin: 0,
              fontFamily: "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
              letterSpacing: "0.02em",
            }}
          >
            Add New Watch
          </h1>
          <p style={{ fontSize: "12.5px", color: "#71717A", marginTop: "4px" }}>
            Add a new watch to your store inventory.
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
            background: "#141414",
            border: "1px solid #27272A",
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Return to Watches
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
            background: message.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.4)"}`,
            borderLeft: `4px solid ${message.type === "success" ? "#34D399" : "#F87171"}`,
            color: message.type === "success" ? "#34D399" : "#F87171",
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
              color: "#FFFFFF",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid #1E1E1E",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            1 · Watch Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <LabeledField label="Watch Model Name" required>
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
                    (e.target as HTMLElement).style.borderColor = "#222222";
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
                  <option key={b} value={b} style={{ background: "#141414", color: "#FFF" }}>
                    {b}
                  </option>
                ))}
              </select>
            </LabeledField>

            <LabeledField label="Category">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={inputSt}
              >
                {["Luxury", "Dive Watches", "Chronograph", "Automatic", "Sports Watches", "Dress Watches"].map((c) => (
                  <option key={c} value={c} style={{ background: "#141414", color: "#FFF" }}>
                    {c}
                  </option>
                ))}
              </select>
            </LabeledField>

            <LabeledField label="Gender">
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputSt}>
                <option value="Men" style={{ background: "#141414", color: "#FFF" }}>Men</option>
                <option value="Women" style={{ background: "#141414", color: "#FFF" }}>Women</option>
                <option value="Unisex" style={{ background: "#141414", color: "#FFF" }}>Unisex</option>
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
              color: "#FFFFFF",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid #1E1E1E",
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
              <LabeledField label="Description">
                <textarea
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide watch details, specifications, and features..."
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
              color: "#FFFFFF",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid #1E1E1E",
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

            <LabeledField label="Stock Quantity">
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
                  style={{ width: "18px", height: "18px", accentColor: "#FFFFFF" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#F8FAFC" }}>
                  Feature prominently on Storefront Homepage (&ldquo;Curated Masterpieces&rdquo; Hero Carousel)
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
              color: "#FFFFFF",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid #1E1E1E",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>4 · High-Resolution Photography & Media</span>
            <span style={{ fontSize: "10px", color: "#A1A1AA", fontWeight: 400 }}>
              {images.length} {images.length === 1 ? "Image" : "Images"} Attached
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                e.target.value = "";
              }
            }}
            style={{ display: "none" }}
          />

          {/* Drag & Drop File Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragOver ? "#C5A059" : "#2A2A2A"}`,
              borderRadius: "12px",
              padding: "28px 20px",
              textAlign: "center",
              background: isDragOver ? "rgba(197, 160, 89, 0.05)" : "#111111",
              cursor: "pointer",
              transition: "all 200ms ease",
              marginBottom: "18px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#18181B",
                  border: "1px solid #27272A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#C5A059",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>
                  {isUploading ? "Uploading & Processing Timepiece Image..." : "Click or Drag & Drop Watch Images Here"}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#71717A" }}>
                  Supports PNG, JPG, WEBP, AVIF from your device (Multiple files supported)
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                style={{
                  marginTop: "6px",
                  padding: "8px 18px",
                  background: "#1C1C1E",
                  border: "1px solid #3F3F46",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>📁</span> {isUploading ? "Processing..." : "Browse Files from Computer"}
              </button>
            </div>
          </div>

          {/* Quick Presets & Manual URL toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "16px",
              padding: "10px 14px",
              background: "#141414",
              borderRadius: "8px",
              border: "1px solid #222222",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "#71717A" }}>Quick Horology Presets:</span>
              {PRESET_GALLERY_SETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setImages(preset.images)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "5px",
                    background: "#1E1E1E",
                    border: "1px solid #2A2A2A",
                    color: "#D4D4D8",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Clear all images button if multiple exist */}
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setImages([])}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#F87171",
                  fontSize: "11px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Add custom URL */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
            <input
              type="text"
              placeholder="Or paste external image URL (https://... or /images/watches/...)"
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
                background: "#27272A",
                border: "1px solid #3F3F46",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Add URL
            </button>
          </div>

          {/* Image Gallery Previews with Primary and Remove controls */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", marginBottom: "10px" }}>
              Current Gallery Images ({images.length}):
            </div>

            {images.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  background: "#141414",
                  borderRadius: "8px",
                  border: "1px dashed #27272A",
                  color: "#71717A",
                  fontSize: "12px",
                }}
              >
                No images added yet. Click &quot;Browse Files from Computer&quot; or drop an image above.
              </div>
            ) : (
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      width: "110px",
                      height: "110px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#18181B",
                      border: i === 0 ? "2px solid #C5A059" : "1px solid #27272A",
                      boxShadow: i === 0 ? "0 0 12px rgba(197, 160, 89, 0.25)" : "none",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <img
                      src={img}
                      alt={`Watch view ${i + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />

                    {/* Primary Badge or Set As Primary Button */}
                    {i === 0 ? (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "3px",
                          left: "3px",
                          right: "3px",
                          textAlign: "center",
                          background: "rgba(197, 160, 89, 0.95)",
                          color: "#000000",
                          fontSize: "8.5px",
                          fontWeight: 800,
                          borderRadius: "4px",
                          padding: "2px 0",
                          letterSpacing: "0.05em",
                        }}
                      >
                        ★ PRIMARY
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(i)}
                        title="Set this image as primary storefront display"
                        style={{
                          position: "absolute",
                          bottom: "3px",
                          left: "3px",
                          right: "3px",
                          textAlign: "center",
                          background: "rgba(0,0,0,0.8)",
                          color: "#D4D4D8",
                          border: "1px solid #3F3F46",
                          fontSize: "8px",
                          fontWeight: 700,
                          borderRadius: "4px",
                          padding: "2px 0",
                          cursor: "pointer",
                        }}
                      >
                        Set Primary
                      </button>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      title="Remove this photo"
                      style={{
                        position: "absolute",
                        top: "3px",
                        right: "3px",
                        background: "rgba(0,0,0,0.85)",
                        color: "#F87171",
                        border: "1px solid rgba(248, 113, 113, 0.4)",
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
            )}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
          <Link
            href="/admin/products"
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              background: "#141414",
              border: "1px solid #27272A",
              color: "#A1A1AA",
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
              background: "#FFFFFF",
              color: "#050505",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 2px 10px rgba(255, 255, 255, 0.15)",
            }}
          >
            {isSubmitting ? "Saving Watch..." : "Add Watch to Store ↗"}
          </button>
        </div>
      </form>
    </div>
  );
}