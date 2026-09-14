"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/api";
import SmoothImage from "@/components/SmoothImage";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedImg(null);
      setQty(1);
    }
  }, [product]);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const activeImg = selectedImg || images[0] || product.image_url;

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const hasDiscount = product.old_price && product.old_price > product.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-white dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] p-5 sm:p-7 text-[#121826] dark:text-[#F8FAFC] shadow-2xl overflow-hidden animate-pageEnter">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl border border-[#E8E2D6] dark:border-[#1E293B] text-[#8C7B65] hover:text-[#121826] dark:hover:text-white transition z-20 cursor-pointer font-bold"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Gallery View */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] overflow-hidden shadow-inner">
              <SmoothImage
                src={activeImg}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] shadow-md">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className={`h-12 w-12 rounded-xl bg-[#FAF8F5] dark:bg-[#080B10] border transition overflow-hidden cursor-pointer ${
                      activeImg === img
                        ? "border-[#D4AF37] dark:border-[#E5C158] ring-2 ring-[#D4AF37]/40 shadow-sm"
                        : "border-[#E8E2D6] dark:border-[#1E293B] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <SmoothImage src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specs */}
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-[#D4AF37] dark:text-[#E5C158] uppercase tracking-widest font-mono font-bold">
                {product.category} • Certified Reference
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#121826] dark:text-[#F8FAFC] mt-0.5 uppercase">
                {product.name}
              </h2>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-[#121826] dark:text-[#F3E5AB] font-num">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#8C7B65] line-through font-num">
                  {formatCurrency(product.old_price!)}
                </span>
              )}
            </div>

            <p className="text-xs text-[#645A4C] dark:text-[#CBD5E1] leading-relaxed line-clamp-3">
              {product.description ||
                "Master-crafted mechanical timepiece engineered with high-beat escapement, serialized exhibition caseback, and 5-year certified atelier warranty."}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)]">
                <div className="text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-semibold">Calibre</div>
                <div className="font-bold text-[#121826] dark:text-[#F8FAFC] truncate font-mono">{product.movement || "Swiss Automatic"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)]">
                <div className="text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-semibold">Diameter</div>
                <div className="font-bold text-[#121826] dark:text-[#F8FAFC] truncate font-mono">{product.case_size || "41mm"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)]">
                <div className="text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-semibold">Case Alloy</div>
                <div className="font-bold text-[#121826] dark:text-[#F8FAFC] truncate">{product.case_material || "316L Surgical Steel"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)]">
                <div className="text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-semibold">Water Resistance</div>
                <div className="font-bold text-[#121826] dark:text-[#F8FAFC] truncate font-mono">{product.water_resistance || "100M / 10 ATM"}</div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-[#8C7B65] hover:text-[#121826] dark:hover:text-white px-2 font-bold"
                >
                  -
                </button>
                <span className="font-mono text-[#121826] dark:text-[#F8FAFC] text-xs px-2 font-bold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="text-[#8C7B65] hover:text-[#121826] dark:hover:text-white px-2 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product, qty);
                  onClose();
                }}
                disabled={product.in_stock === false}
                className="flex-1 py-3 px-4 rounded-xl lux-btn-gold text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-xl transition"
              >
                {product.in_stock === false ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            <div className="text-center pt-1">
              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="text-xs text-[#D4AF37] dark:text-[#E5C158] hover:underline font-mono font-bold"
              >
                View Full Technical Dossier →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
