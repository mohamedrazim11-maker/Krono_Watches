"use client";

import Link from "next/link";
import { Product } from "@/lib/api";
import SmoothImage from "@/components/SmoothImage";

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
  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
    : product.promo_discount_percent || 0;

  return (
    <div className="group relative rounded-2xl lux-card p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden bg-white dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.14)] hover:border-[#D4AF37] dark:hover:border-[#E5C158] transition-all duration-300 shadow-md hover:shadow-2xl">
      {/* Ambient hover gold glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#D4AF37]/15 transition-all"></div>

      {/* Top Header: Badges & Wishlist */}
      <div>
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.badge && (
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] shadow-sm">
                {product.badge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border border-[#F43F5E]/30 text-[#F43F5E] bg-[#FFF1F2] dark:bg-[#4C0519]/40">
                -{discountPercent}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick View Button */}
            <button
              onClick={() => onQuickView(product)}
              className="p-1.5 rounded-lg border border-[#E8E2D6] dark:border-[#1E293B] bg-[#FAF8F5] dark:bg-[#141D2E] text-[#8C7B65] dark:text-[#CBD5E1] hover:text-[#D4AF37] dark:hover:text-[#E5C158] hover:border-[#D4AF37] transition cursor-pointer shadow-sm opacity-0 group-hover:opacity-100 duration-200"
              title="Quick inspect"
              aria-label="Quick View"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-1.5 rounded-lg border transition cursor-pointer shadow-sm ${
                isWishlisted
                  ? "bg-[#FFF1F2] dark:bg-[#881337]/30 border-[#F43F5E] text-[#F43F5E]"
                  : "bg-[#FAF8F5] dark:bg-[#141D2E] text-[#8C7B65] dark:text-[#CBD5E1] hover:text-[#F43F5E] border-[#E8E2D6] dark:border-[#1E293B] hover:border-[#F43F5E]"
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
        </div>

        {/* Product Image Stage */}
        <Link
          href={`/products/${product.id}`}
          className="relative aspect-[4/3] w-full my-3 block overflow-hidden rounded-xl bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.1)] shadow-inner group/img"
        >
          <SmoothImage
            src={product.image_url}
            alt={product.name}
            className="group-hover/img:scale-108 transition-transform duration-700 ease-out"
          />
        </Link>
      </div>

      {/* Info & Specs */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[10px] text-[#8C7B65] dark:text-[#A3937C] font-mono">
          <span className="uppercase tracking-[0.15em] text-[#D4AF37] dark:text-[#E5C158] font-bold">
            {product.category || "Horology"}
          </span>
          {product.movement && (
            <span className="truncate max-w-[120px] text-[#8C7B65] dark:text-[#64748B]">
              {product.movement}
            </span>
          )}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-bold text-[#121826] dark:text-[#F8FAFC] group-hover:text-[#D4AF37] dark:group-hover:text-[#E5C158] transition line-clamp-1 font-display tracking-tight">
            {product.name}
          </h3>
        </Link>

        {/* Technical Specification Chips */}
        <div className="flex flex-wrap gap-1 text-[9px] text-[#8C7B65] dark:text-[#CBD5E1] font-mono">
          {product.case_size && (
            <span className="px-1.5 py-0.5 rounded border border-[#E8E2D6] dark:border-[#1E293B] bg-[#FAF8F5] dark:bg-[#141D2E]">
              {product.case_size}
            </span>
          )}
          {product.water_resistance && (
            <span className="px-1.5 py-0.5 rounded border border-[#E8E2D6] dark:border-[#1E293B] bg-[#FAF8F5] dark:bg-[#141D2E]">
              {product.water_resistance}
            </span>
          )}
        </div>

        {/* Valuation Pricing & Stock */}
        <div className="flex items-end justify-between pt-2.5 border-t border-[#EBE5DB] dark:border-[#182234]">
          <div>
            <div className="text-[8px] uppercase tracking-wider text-[#8C7B65] dark:text-[#64748B] font-mono font-bold">
              Valuation
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#121826] dark:text-[#F3E5AB] font-num">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#8C7B65] dark:text-[#64748B] line-through font-num">
                  {formatCurrency(product.old_price!)}
                </span>
              )}
            </div>
          </div>

          <div>
            {product.in_stock === false ? (
              <span className="text-[10px] font-mono text-[#8C7B65] uppercase">
                Sold Out
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#059669] dark:text-[#10B981] font-semibold uppercase flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse"></span> In Stock
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1.5">
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.in_stock === false}
            className={`w-full py-2 px-3 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
              product.in_stock === false
                ? "bg-[#FAF8F5] dark:bg-[#141D2E] text-[#8C7B65] cursor-not-allowed border border-[#E8E2D6] dark:border-[#1E293B]"
                : "lux-btn-primary"
            }`}
          >
            {product.in_stock === false ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
