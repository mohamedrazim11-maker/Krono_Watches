"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import { useCart } from "@/lib/CartContext";
import { useTheme } from "@/lib/ThemeContext";
import { getProductImage } from "@/lib/productImages";

export default function WishlistPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    wishlist,
    totalItems,
    toggleWishlist,
    moveToCart,
    moveAllWishlistToCart,
    toastMessage,
  } = useCart();

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? "bg-[#07080A] text-white" : "bg-neutral-50 text-neutral-900"
      }`}
    >
      <Navbar cartCount={totalItems} wishlistCount={wishlist.length} />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C5A059] text-black px-5 py-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-2xl">
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
            isDark ? "border-[#1A1D24]" : "border-neutral-200"
          }`}
        >
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
                My Wishlist
              </h1>
              <span className={`text-xs sm:text-sm font-mono ${isDark ? "text-[#8E95A5]" : "text-neutral-500"}`}>
                ({wishlist.length} {wishlist.length === 1 ? "timepiece" : "timepieces"})
              </span>
            </div>
            <p className={`text-xs font-mono mt-1 ${isDark ? "text-[#8E95A5]" : "text-neutral-500"}`}>
              Saved luxury calibres and favorite watches. Move items to your cart whenever you are ready to checkout.
            </p>
          </div>

          {/* Bulk Action */}
          {wishlist.length > 0 && (
            <button
              type="button"
              onClick={moveAllWishlistToCart}
              className="px-6 py-3 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-[#C5A059]/20 flex items-center gap-2 cursor-pointer self-start sm:self-center"
            >
              <span>🛒</span>
              <span>Move All to Cart ({wishlist.length})</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div
            className={`rounded-2xl p-8 sm:p-16 text-center space-y-6 border ${
              isDark ? "bg-[#0E1015] border-[#1E232B]" : "bg-white border-neutral-200 shadow-sm"
            }`}
          >
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl ${
                isDark ? "bg-[#15181F] text-[#C5A059] border border-[#282E38]" : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}
            >
              ♥
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold uppercase tracking-tight">
                Your Wishlist is Empty
              </h2>
              <p className={`text-xs font-mono leading-relaxed ${isDark ? "text-[#8E95A5]" : "text-neutral-500"}`}>
                Save your favorite watches while browsing our catalogue by clicking the heart icon. They will be saved here ready for you.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-block px-8 py-3.5 bg-[#C5A059] text-black text-xs font-mono font-bold tracking-widest uppercase hover:bg-[#b08d48] transition-colors rounded-lg shadow-lg"
              >
                Explore Catalogue
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const img = getProductImage(item.id, item.image_url);
              const brand = (item.brand || "KRONO").toUpperCase();
              const caseSize = item.case_size || "41mm";
              const movement = item.movement || "Automatic";

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all group ${
                    isDark
                      ? "bg-[#0E1015] border-[#1E232B] hover:border-[#C5A059]/40"
                      : "bg-white border-neutral-200 hover:border-amber-400 shadow-sm"
                  }`}
                >
                  <div>
                    {/* Top image box with remove button */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden p-4 flex items-center justify-center mb-4 bg-[#14161C] border border-[#262A33]">
                      <SmoothImage
                        src={img}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-[#C5A059] hover:text-red-400 flex items-center justify-center text-sm transition-colors cursor-pointer backdrop-blur-xs"
                        title="Remove from wishlist"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono tracking-widest uppercase text-[#C5A059] font-bold">
                        {brand}
                      </div>
                      <Link
                        href={`/products/${item.id}`}
                        className="block text-sm font-semibold hover:text-[#C5A059] transition-colors truncate"
                      >
                        {item.name}
                      </Link>
                      <div className={`text-xs font-mono ${isDark ? "text-[#8E95A5]" : "text-neutral-500"}`}>
                        {caseSize} · {movement}
                      </div>
                      <div className="text-sm font-mono font-bold text-[#C5A059] pt-1">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Move to Cart & View */}
                  <div className="space-y-2 pt-5 border-t border-neutral-800/40 mt-4">
                    <button
                      type="button"
                      onClick={() => moveToCart(item)}
                      className="w-full py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all shadow cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🛒</span>
                      <span>Move to Cart</span>
                    </button>

                    <Link
                      href={`/products/${item.id}`}
                      className="block w-full py-2 text-center text-xs font-mono text-[#8E95A5] hover:text-white transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

