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
  const moveToCart = cartContext.moveToCart;
  const moveAllWishlistToCart = cartContext.moveAllWishlistToCart;

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

  const handleMove = (product: Product) => {
    if (propMoveToCart) {
      propMoveToCart(product);
    } else {
      moveToCart(product);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end">
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
              Your Wishlist ({wishlist.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/wishlist"
              onClick={onClose}
              className="text-xs font-mono text-[#C5A059] hover:underline uppercase tracking-wider"
            >
              Full Page ↗
            </Link>
            <button
              onClick={onClose}
              className="p-1 text-white/60 hover:text-white transition font-bold text-sm leading-none"
              aria-label="Close wishlist"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="text-4xl text-[#C5A059]">♡</div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  No Saved Watches
                </h3>
                <p className="text-xs text-white/50 max-w-xs font-mono">
                  Save your favorite watches here with 1 click to view or move to cart later.
                </p>
              </div>
              <Link
                href="/catalog"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#C5A059] text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#b08d48] rounded-lg"
              >
                Browse Watches
              </Link>
            </div>
          ) : (
            wishlist.map((product) => {
              const img = getProductImage(product.id, product.image_url);
              return (
                <div
                  key={product.id}
                  className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-xl p-3.5 flex gap-3.5 items-center justify-between hover:border-[#262A33] transition-colors"
                >
                  <Link
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="h-16 w-16 bg-black border border-white/10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1"
                  >
                    <SmoothImage
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[9px] font-mono uppercase text-[#C5A059] font-bold truncate">
                      {product.brand || "KRONO"}
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      onClick={onClose}
                      className="block text-xs font-semibold text-white truncate hover:text-[#C5A059] transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs font-mono font-bold text-[#C5A059]">
                      {formatCurrency(product.price)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {/* Baymard UX: Move wishlist product to cart */}
                    <button
                      type="button"
                      onClick={() => handleMove(product)}
                      className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                      title="Move product directly to Cart"
                    >
                      Move to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(product)}
                      className="text-[10px] text-[#8E95A5] hover:text-red-400 font-mono transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Move All to Cart */}
        {wishlist.length > 0 && (
          <div className="p-4 bg-[#0D0D0D] border-t border-[#1a1a1a] space-y-2">
            <button
              type="button"
              onClick={() => {
                moveAllWishlistToCart();
                onClose();
              }}
              className="w-full py-3 bg-white hover:bg-[#C5A059] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🛒</span>
              <span>Move All to Cart ({wishlist.length})</span>
            </button>
            <p className="text-[10px] font-mono text-center text-[#8E95A5]">
              Items will be transferred directly to your shopping cart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
