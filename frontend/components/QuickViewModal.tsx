"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/api";
import SmoothImage from "@/components/SmoothImage";
import { getProductImage, getProductImages } from "@/lib/productImages";

interface QuickViewModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
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

  const images = getProductImages(product.id, product.images, product.image_url);
  const activeImg = selectedImg || getProductImage(product.id, product.image_url);

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const hasDiscount = product.old_price && product.old_price > product.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl bg-[#0D0D0D] border border-white/20 p-6 sm:p-8 text-white shadow-2xl overflow-hidden animate-pageEnter font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition font-bold text-sm"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Image & Thumbnails */}
          <div className="space-y-3">
            <div className="aspect-square bg-black border border-white/10 relative overflow-hidden">
              <SmoothImage
                src={activeImg}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 text-[9px] font-mono font-bold tracking-wider uppercase bg-[#C5A059] text-black px-2 py-0.5 shadow">
                  {product.badge}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(img)}
                    className={`w-14 h-14 bg-black border relative overflow-hidden flex-shrink-0 transition-all ${
                      activeImg === img ? "border-[#C5A059]" : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <SmoothImage src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-mono text-[#C5A059] uppercase font-bold tracking-widest">
                {product.brand} • {product.category}
              </div>
              <h3 className="text-xl font-serif font-bold text-white leading-tight mt-1">
                {product.name}
              </h3>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-xl font-mono font-bold text-[#C5A059]">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs font-mono text-white/40 line-through">
                  {formatCurrency(product.old_price!)}
                </span>
              )}
            </div>

            <p className="text-xs text-white/60 font-mono line-clamp-3 leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-y border-[#1a1a1a] py-3">
              <div>
                <span className="text-white/40 block">Calibre:</span>
                <span className="text-white font-medium">{product.movement || "Swiss Automatic"}</span>
              </div>
              <div>
                <span className="text-white/40 block">Diameter:</span>
                <span className="text-white font-medium">{product.case_size || "41mm"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center border border-[#2a2a2a] bg-[#111]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-white/70 hover:text-white"
                >
                  -
                </button>
                <span className="px-3 py-1 font-mono text-xs font-bold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-2.5 py-1 text-white/70 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product, qty);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-white hover:bg-[#C5A059] hover:text-black text-black font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                Acquire Piece
              </button>

              {onToggleWishlist && (
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-2.5 border transition-colors ${
                    isInWishlist ? "border-red-500 text-red-500" : "border-[#2a2a2a] text-white/60 hover:text-white"
                  }`}
                >
                  ♥
                </button>
              )}
            </div>

            <div className="pt-2 text-center">
              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="text-xs font-mono text-[#C5A059] hover:underline uppercase tracking-wider"
              >
                View Full Dossier &amp; Specifications →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
