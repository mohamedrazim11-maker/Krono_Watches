"use client";

import Link from "next/link";
import { Product } from "@/lib/api";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (product: Product) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onMoveToCart,
}: WishlistDrawerProps) {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#131B2A] border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex flex-col h-full shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#0B0F17]/80">
          <div>
            <h2 className="text-sm font-black font-display uppercase tracking-widest text-slate-900 dark:text-white">Saved Timepieces</h2>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono font-semibold">
              {wishlist.length} {wishlist.length === 1 ? "Piece" : "Pieces"} Bookmarked
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="text-4xl text-slate-300 dark:text-slate-700">♡</div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">No Saved Pieces</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  Bookmark master references to build your private portfolio.
                </p>
              </div>
              <Link
                href="/catalog"
                onClick={onClose}
                className="lux-btn-primary px-6 py-2.5 rounded-lg text-xs font-bold"
              >
                Browse Catalogue
              </Link>
            </div>
          ) : (
            wishlist.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 flex gap-3 items-center justify-between bg-slate-50/50 dark:bg-[#0B0F17]/50 hover:bg-slate-50 dark:hover:bg-[#0B0F17] transition"
              >
                <div className="h-14 w-14 rounded-xl bg-white dark:bg-[#131B2A] p-1 flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="text-xs font-bold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-amber-400 truncate block font-display"
                  >
                    {product.name}
                  </Link>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase font-semibold">
                    {product.category}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-amber-400 font-num pt-0.5">
                    {formatCurrency(product.price)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onRemoveFromWishlist(product.id)}
                    className="text-[10px] text-slate-400 hover:text-red-500 transition font-mono"
                  >
                    Remove
                  </button>

                  <button
                    onClick={() => onMoveToCart(product)}
                    className="px-3 py-1 rounded-lg lux-btn-primary text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                  >
                    + Bag
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0B0F17]/80">
            <Link
              href="/catalog"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl lux-btn-secondary text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm"
            >
              Continue Exploring Vault →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
