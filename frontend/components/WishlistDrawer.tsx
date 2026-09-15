"use client";

import Link from "next/link";
import { Product } from "@/lib/api";
import SmoothImage from "@/components/SmoothImage";
import { useCart } from "@/lib/CartContext";
import { getProductImage } from "@/lib/productImages";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist?: Product[];
  onRemoveFromWishlist?: (id: string) => void;
  onMoveToCart?: (product: Product) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist: propWishlist,
  onRemoveFromWishlist: propRemoveFromWishlist,
  onMoveToCart: propMoveToCart,
}: WishlistDrawerProps) {
  const cartContext = useCart();
  const wishlist = propWishlist ?? cartContext.wishlist;
  const toggleWishlist = cartContext.toggleWishlist;
  const addToCart = cartContext.addToCart;
  const showToast = cartContext.showToast;

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const handleRemove = (product: Product) => {
    if (propRemoveFromWishlist) {
      propRemoveFromWishlist(product.id);
    } else {
      toggleWishlist(product);
    }
  };

  const handleAcquire = (product: Product) => {
    if (propMoveToCart) {
      propMoveToCart(product);
    } else {
      addToCart(product, 1);
      showToast(`Added ${product.name} to portfolio.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div className="relative z-10 w-full max-w-md bg-[#0A0A0A] border-l border-[#1a1a1a] text-white flex flex-col h-full shadow-2xl animate-pageEnter font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#C5A059] text-lg">♥</span>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Curated Wishlist ({wishlist.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="text-4xl text-[#C5A059]">♡</div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  No Saved Timepieces
                </h3>
                <p className="text-xs text-white/50 max-w-xs font-mono">
                  Bookmark your desired Swiss calibres to build your personal horology registry.
                </p>
              </div>
              <Link
                href="/catalog"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#C5A059] text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#b08d48]"
              >
                Browse Catalogue
              </Link>
            </div>
          ) : (
            wishlist.map((product) => {
              const img = getProductImage(product.id, product.image_url);
              return (
                <div
                  key={product.id}
                  className="bg-[#0D0D0D] border border-[#1a1a1a] p-3.5 flex gap-3.5 items-center justify-between"
                >
                  <div className="h-16 w-16 bg-black border border-white/10 overflow-hidden flex-shrink-0">
                    <SmoothImage
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[9px] font-mono uppercase text-[#C5A059] font-bold truncate">
                      {product.brand}
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {product.name}
                    </div>
                    <div className="text-xs font-mono font-bold text-[#C5A059]">
                      {formatCurrency(product.price)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAcquire(product)}
                      className="px-3 py-1 bg-white hover:bg-[#C5A059] text-black text-[11px] font-mono font-bold uppercase"
                    >
                      Acquire
                    </button>
                    <button
                      onClick={() => handleRemove(product)}
                      className="text-[10px] text-red-400 hover:text-red-300 font-mono underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
