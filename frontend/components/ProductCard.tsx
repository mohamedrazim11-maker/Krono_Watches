"use client";

import Link from "next/link";
import { Product } from "@/lib/api";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
}: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(
    product.image_url || "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1000&q=85"
  );

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
    : product.promo_discount_percent || 0;

  return (
    <div className="group relative rounded-2xl lux-card p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden bg-white dark:bg-[#131B2A] border border-slate-200/90 dark:border-slate-800 transition-colors duration-200">
      {/* Top Badges & Wishlist */}
      <div>
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.badge && (
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm">
                {product.badge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900">
                -{discountPercent}%
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isWishlisted
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:border-slate-400"
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-label="Wishlist toggle"
          >
            <svg
              className="w-3.5 h-3.5"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Product Image Stage (Edge-to-Edge Flush Container) */}
        <Link
          href={`/products/${product.id}`}
          className="relative aspect-[4/3] w-full my-2.5 block overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-inner"
        >
          <img
            src={imgSrc}
            alt={product.name}
            onError={() =>
              setImgSrc("https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=80")
            }
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </Link>
      </div>

      {/* Info & Specs */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <span className="uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300 font-bold">
            {product.category || "Horology"}
          </span>
          {product.movement && (
            <span className="truncate max-w-[120px] text-slate-500 dark:text-slate-400">
              {product.movement}
            </span>
          )}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition line-clamp-1 font-display tracking-tight">
            {product.name}
          </h3>
        </Link>

        {/* Technical Chips */}
        <div className="flex flex-wrap gap-1 text-[9px] text-slate-600 dark:text-slate-400 font-mono">
          {product.case_size && (
            <span className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              {product.case_size}
            </span>
          )}
          {product.water_resistance && (
            <span className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              {product.water_resistance}
            </span>
          )}
        </div>

        {/* Pricing & Stock */}
        <div className="flex items-end justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Valuation</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-num">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-num">
                  {formatCurrency(product.old_price!)}
                </span>
              )}
            </div>
          </div>

          <div>
            {product.in_stock === false ? (
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Sold Out
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold uppercase flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> In Vault
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.in_stock === false}
            className={`w-full py-2 px-3 rounded-xl text-xs uppercase tracking-wider font-extrabold transition cursor-pointer ${
              product.in_stock === false
                ? "bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-800"
                : "lux-btn-primary"
            }`}
          >
            {product.in_stock === false ? "Out of Vault" : "Acquire Piece"}
          </button>
        </div>
      </div>
    </div>
  );
}
