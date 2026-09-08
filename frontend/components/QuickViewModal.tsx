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
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 p-5 sm:p-7 text-slate-900 dark:text-white shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition z-20 cursor-pointer font-bold"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Gallery View */}
          <div className="space-y-2.5">
            <div className="relative aspect-square rounded-2xl bg-slate-100 dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-inner">
              <SmoothImage
                src={activeImg}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-md">
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
                    className={`h-11 w-11 rounded-xl bg-slate-100 dark:bg-[#0B0F17] border transition overflow-hidden cursor-pointer ${
                      activeImg === img
                        ? "border-slate-900 dark:border-amber-400 ring-2 ring-slate-900 dark:ring-amber-400 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <SmoothImage src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specs */}
          <div className="space-y-3.5">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono font-bold">
                {product.category} • Reference Calibre
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white mt-0.5 uppercase">
                {product.name}
              </h2>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-slate-900 dark:text-amber-400 font-num">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-num">
                  {formatCurrency(product.old_price!)}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
              {product.description ||
                "Master-crafted mechanical timepiece engineered with high-beat escapement, serialized exhibition caseback, and 5-year certified atelier warranty."}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800">
                <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-semibold">Calibre</div>
                <div className="font-bold text-slate-900 dark:text-white truncate font-mono">{product.movement || "Swiss Automatic"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800">
                <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-semibold">Diameter</div>
                <div className="font-bold text-slate-900 dark:text-white truncate font-mono">{product.case_size || "41mm"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800">
                <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-semibold">Case Alloy</div>
                <div className="font-bold text-slate-900 dark:text-white truncate">{product.case_material || "316L Surgical Steel"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800">
                <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-semibold">Water Resistance</div>
                <div className="font-bold text-slate-900 dark:text-white truncate font-mono">{product.water_resistance || "100M / 10 ATM"}</div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 font-bold"
                >
                  -
                </button>
                <span className="font-mono text-slate-900 dark:text-white text-xs px-2 font-bold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 font-bold"
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
                className="flex-1 py-3 px-4 rounded-xl lux-btn-primary text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition"
              >
                {product.in_stock === false ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            <div className="text-center pt-1">
              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-amber-400 font-mono underline underline-offset-4 font-semibold"
              >
                View Full Technical Specifications →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
