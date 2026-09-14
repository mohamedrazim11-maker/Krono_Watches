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
    <div className="group relative rounded-2xl lux-card p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden bg-white dark:bg-[#0B1C15] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] hover:border-[#006039] dark:hover:border-[#00A362] transition-all duration-300 shadow-sm hover:shadow-xl">
      {/* Ambient hover green glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#006039]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#006039]/15 transition-all"></div>

      {/* Top Header: Badges & Wishlist */}
      <div>
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.badge && (
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#006039] text-white shadow-sm">
                {product.badge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border border-[#E11D48]/30 text-[#E11D48] bg-[#FFF1F2] dark:bg-[#4C0519]/40">
                -{discountPercent}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick View Button */}
            <button
              onClick={() => onQuickView(product)}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1F4535] bg-[#F8FAF9] dark:bg-[#11261D] text-[#5A6D64] dark:text-[#CBD5E1] hover:text-[#006039] dark:hover:text-[#4ADE80] hover:border-[#006039] transition cursor-pointer shadow-sm opacity-0 group-hover:opacity-100 duration-200"
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
                  ? "bg-[#FFF1F2] dark:bg-[#881337]/30 border-[#E11D48] text-[#E11D48]"
                  : "bg-[#F8FAF9] dark:bg-[#11261D] text-[#5A6D64] dark:text-[#CBD5E1] hover:text-[#E11D48] border-[#E2E8F0] dark:border-[#1F4535] hover:border-[#E11D48]"
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
          className="relative aspect-[4/3] w-full my-3 block overflow-hidden rounded-xl bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.2)] shadow-inner group/img"
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
        <div className="flex items-center justify-between text-[10px] text-[#5A6D64] dark:text-[#8EAA9C] font-mono">
          <span className="uppercase tracking-[0.15em] text-[#006039] dark:text-[#4ADE80] font-bold">
            {product.category || "Horology"}
          </span>
          {product.movement && (
            <span className="truncate max-w-[120px] text-[#64748B] dark:text-[#8EAA9C]">
              {product.movement}
            </span>
          )}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#006039] dark:group-hover:text-[#4ADE80] transition line-clamp-1 font-display tracking-tight">
            {product.name}
          </h3>
        </Link>

        {/* Technical Specification Chips */}
        <div className="flex flex-wrap gap-1 text-[9px] text-[#5A6D64] dark:text-[#CBD5E1] font-mono">
          {product.case_size && (
            <span className="px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-[#1F4535] bg-[#F8FAF9] dark:bg-[#11261D]">
              {product.case_size}
            </span>
          )}
          {product.water_resistance && (
            <span className="px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-[#1F4535] bg-[#F8FAF9] dark:bg-[#11261D]">
              {product.water_resistance}
            </span>
          )}
        </div>

        {/* Valuation Pricing & Stock */}
        <div className="flex items-end justify-between pt-2.5 border-t border-[#E5ECE8] dark:border-[#122B20]">
          <div>
            <div className="text-[8px] uppercase tracking-wider text-[#5A6D64] dark:text-[#8EAA9C] font-mono font-bold">
              Valuation
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#006039] dark:text-[#4ADE80] font-num">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#64748B] line-through font-num">
                  {formatCurrency(product.old_price!)}
                </span>
              )}
            </div>
          </div>

          <div>
            {product.in_stock === false ? (
              <span className="text-[10px] font-mono text-[#64748B] uppercase">
                Sold Out
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#006039] dark:text-[#10B981] font-semibold uppercase flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#006039] dark:bg-[#10B981] animate-pulse"></span> Available
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
                ? "bg-[#F8FAF9] dark:bg-[#11261D] text-[#64748B] cursor-not-allowed border border-[#E2E8F0] dark:border-[#1F4535]"
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
