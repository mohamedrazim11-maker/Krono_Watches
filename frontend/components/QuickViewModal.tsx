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

      <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-white dark:bg-[#0B1C15] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] p-5 sm:p-7 text-[#0F172A] dark:text-[#F8FAFC] shadow-2xl overflow-hidden animate-pageEnter">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl border border-[#E2E8F0] dark:border-[#1F4535] text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white transition z-20 cursor-pointer font-bold"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Gallery View */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] overflow-hidden shadow-inner">
              <SmoothImage
                src={activeImg}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#006039] text-white shadow-md">
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
                    className={`h-12 w-12 rounded-xl bg-[#F8FAF9] dark:bg-[#06110D] border transition overflow-hidden cursor-pointer ${
                      activeImg === img
                        ? "border-[#006039] dark:border-[#00A362] ring-2 ring-[#006039]/40 shadow-sm"
                        : "border-[#E2E8F0] dark:border-[#1F4535] opacity-60 hover:opacity-100"
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
              <div className="text-[10px] text-[#006039] dark:text-[#4ADE80] uppercase tracking-widest font-mono font-bold">
                {product.category} • Certified Reference
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 uppercase">
                {product.name}
              </h2>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-[#006039] dark:text-[#4ADE80] font-num">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#64748B] line-through font-num">
                  {formatCurrency(product.old_price!)}
                </span>
              )}
            </div>

            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed line-clamp-3">
              {product.description ||
                "Master-crafted mechanical timepiece engineered with Superlative Chronometer escapement, serialized exhibition caseback, and 5-year certified atelier warranty."}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
              <div className="p-2.5 rounded-xl bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.2)]">
                <div className="text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-semibold">Calibre</div>
                <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate font-mono">{product.movement || "Rolex Calibre 3235"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.2)]">
                <div className="text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-semibold">Diameter</div>
                <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate font-mono">{product.case_size || "41mm"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.2)]">
                <div className="text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-semibold">Case Alloy</div>
                <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">{product.case_material || "Oystersteel (904L)"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.2)]">
                <div className="text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-semibold">Water Resistance</div>
                <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate font-mono">{product.water_resistance || "300M / 30 ATM"}</div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[#1F4535] rounded-xl px-3 py-2 text-xs">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white px-2 font-bold"
                >
                  -
                </button>
                <span className="font-mono text-[#0F172A] dark:text-[#F8FAFC] text-xs px-2 font-bold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white px-2 font-bold"
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
                className="flex-1 py-3 px-4 rounded-xl lux-btn-primary text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-xl transition"
              >
                {product.in_stock === false ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            <div className="text-center pt-1">
              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="text-xs text-[#006039] dark:text-[#4ADE80] hover:underline font-mono font-bold"
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
