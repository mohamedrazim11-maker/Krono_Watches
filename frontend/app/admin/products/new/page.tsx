"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api";
import Link from "next/link";

const PRESET_GALLERY_SETS = [
  {
    name: "Classic Obsidian",
    category: "Luxury",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Automatic Chrono Steel",
    category: "Automatic",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Titanium Diver 300M",
    category: "Sport",
    images: [
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

export default function UploadProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    brand: "Krono Atelier",
    category: "Luxury",
    gender: "Men",
    case_size: "41mm",
    price: "",
    old_price: "",
    badge: "Masterpiece",
    warranty: "5 Years Certified International Warranty",
    promotion_period: "Active Season Privilege",
    movement: "Swiss Automatic ETA 2824-2",
    case_material: "316L Stainless Steel & Sapphire Glass",
    water_resistance: "100m (10 ATM)",
    stock_count: "10",
    description: "",
    is_featured: true,
  });

  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      alert("This image URL is already in the list.");
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    if (images.length === 1) {
      alert("At least one primary image is required.");
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const priceNum = parseFloat(formData.price);
    const oldPriceNum = formData.old_price ? parseFloat(formData.old_price) : undefined;
    const stockNum = parseInt(formData.stock_count, 10) || 0;

    if (isNaN(priceNum) || priceNum <= 0) {
      setMessage({ type: "error", text: "Please enter a valid retail valuation." });
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
        images: images,
        movement: formData.movement,
        case_material: formData.case_material,
        water_resistance: formData.water_resistance,
        stock_count: stockNum,
        in_stock: stockNum > 0,
        description: formData.description,
        is_featured: formData.is_featured,
      });

      setMessage({ type: "success", text: "Timepiece successfully registered in database!" });
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to register timepiece." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Atelier Ingestion</span>
          <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight mt-1">Register New Timepiece</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Publish a certified luxury watch with multi-angle photography and horological specs.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="lux-btn-secondary px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm"
        >
          ← Catalogue
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-mono font-bold ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 bg-white dark:bg-[#131B2A] shadow-sm">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            1. Identity & Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Reference Name *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Krono Royal Sovereign Tourbillon Automatic"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Manufacture / Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Krono Atelier, Rolex, Omega"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Category Discipline</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none font-mono"
              >
                <option value="Luxury">Luxury</option>
                <option value="Automatic">Automatic</option>
                <option value="Sport">Sport</option>
                <option value="Smart">Smart</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Demography</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none font-mono"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Case Dimension</label>
              <input
                type="text"
                name="case_size"
                value={formData.case_size}
                onChange={handleChange}
                placeholder="e.g. 41mm"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 bg-white dark:bg-[#131B2A] shadow-sm">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            2. Valuation, Warranty & Stock
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Retail Price (LKR) *</label>
              <input
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 450000"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none font-num"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Pre-Discount Price (LKR)</label>
              <input
                type="number"
                name="old_price"
                value={formData.old_price}
                onChange={handleChange}
                placeholder="e.g. 520000"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none font-num"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Stock Count</label>
              <input
                type="number"
                name="stock_count"
                value={formData.stock_count}
                onChange={handleChange}
                placeholder="10"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none font-num"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Warranty Certification</label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Badge Label</label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="Masterpiece, New Release"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 bg-white dark:bg-[#131B2A] shadow-sm">
          <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            3. Horological Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Movement Calibre</label>
              <input
                type="text"
                name="movement"
                value={formData.movement}
                onChange={handleChange}
                placeholder="Swiss ETA 2824-2"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Material</label>
              <input
                type="text"
                name="case_material"
                value={formData.case_material}
                onChange={handleChange}
                placeholder="316L Surgical Steel & Sapphire"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Water Resistance</label>
              <input
                type="text"
                name="water_resistance"
                value={formData.water_resistance}
                onChange={handleChange}
                placeholder="100m (10 ATM)"
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">Horological Narrative</label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Craftsmanship breakdown, finishing, and calibre pedigree..."
                className="mt-1 w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 accent-slate-900 dark:accent-amber-400 h-4 w-4"
                />
                <span className="font-semibold">Pin as Featured Masterpiece</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 bg-white dark:bg-[#131B2A] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">
              4. Photography ({images.length})
            </h2>
            <div className="flex gap-2">
              {PRESET_GALLERY_SETS.map((set, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImages(set.images)}
                  className="text-[9px] font-mono uppercase font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Load {set.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste high-res Unsplash / CDN image URL..."
                className="flex-1 rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-4 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="lux-btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                + Add Image
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group h-32 bg-slate-50 dark:bg-[#0B0F17] p-1 flex items-center justify-center">
                  <img src={img} alt={`Preview ${idx + 1}`} className="h-full w-full object-contain" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 text-[8px] font-mono uppercase tracking-wider bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 px-2 py-0.5 rounded font-bold">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl lux-btn-primary font-black py-3.5 text-xs uppercase tracking-[0.15em] transition cursor-pointer shadow-md hover:shadow-lg"
          >
            {isSubmitting ? "Ingesting..." : "Authorize Timepiece Registration →"}
          </button>
        </div>
      </form>
    </div>
  );
}