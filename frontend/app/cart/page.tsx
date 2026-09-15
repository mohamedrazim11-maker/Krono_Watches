"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/lib/CartContext";
import { getProductImage } from "@/lib/productImages";

export default function CartPage() {
  const {
    cart,
    totalItems,
    subtotal,
    grandTotal,
    discountAmount,
    appliedCoupon,
    couponDiscountPercent,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isInWishlist,
    applyCoupon,
    isCheckoutOpen,
    setIsCheckoutOpen,
    toastMessage,
    showToast,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput.trim());
    if (!success) {
      setCouponError("Invalid privilege voucher code. Try MONO20 or ROYAL20");
    } else {
      setCouponInput("");
      showToast(`Privilege code applied! 20% discount granted.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar cartCount={totalItems} />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C5A059] text-black px-5 py-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-2xl">
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A059] font-bold">
              Haute Horlogerie Portfolio
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-sans">
              Vault Portfolio
            </h1>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-white/60">
                {totalItems} {totalItems === 1 ? "Piece" : "Pieces"} Allocated
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-300 font-mono underline uppercase tracking-wider"
              >
                Clear Portfolio
              </button>
            </div>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-12 sm:p-20 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-2xl text-[#C5A059]">
              ⏳
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white">
                Your Vault Portfolio is Empty
              </h2>
              <p className="text-xs text-white/50 font-mono leading-relaxed">
                You have not allocated any certified mechanical timepieces to your active dossier yet. Explore the collection to reserve a reference.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-block px-8 py-3.5 bg-[#C5A059] text-black text-xs font-mono font-bold tracking-widest uppercase hover:bg-[#b08d48] transition-colors"
              >
                Explore Catalogue
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Table & Checkout Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Table */}
            <div className="lg:col-span-8 bg-[#0D0D0D] border border-[#1a1a1a]">
              <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center text-xs font-mono uppercase text-white/50">
                <span>Allocated Reference</span>
                <span>Subtotal</span>
              </div>

              <div className="divide-y divide-[#1a1a1a]">
                {cart.map((item) => {
                  const resolvedImg = getProductImage(item.product.id, item.product.image_url);
                  const itemSubtotal = item.product.price * item.quantity;
                  const isSaved = isInWishlist(item.product.id);

                  return (
                    <div
                      key={item.product.id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-black border border-white/10 relative overflow-hidden flex-shrink-0">
                          <SmoothImage
                            src={resolvedImg}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] font-mono uppercase text-[#C5A059] font-bold">
                            {item.product.brand}
                          </div>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="block text-sm font-semibold text-white hover:text-[#C5A059] transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <div className="text-xs font-mono text-white/50">
                            Unit Valuation: {formatCurrency(item.product.price)}
                          </div>
                          <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                            <button
                              onClick={() => {
                                if (!isSaved) toggleWishlist(item.product);
                                removeFromCart(item.product.id);
                                showToast(`Moved to wishlist.`);
                              }}
                              className="text-white/40 hover:text-white underline"
                            >
                              Save for Later
                            </button>
                            <span>•</span>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-400 hover:text-red-300 underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#1a1a1a]">
                        <div className="flex items-center border border-[#2a2a2a] bg-[#111]">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="px-2.5 py-1 text-white/70 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-mono text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="px-2.5 py-1 text-white/70 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-sm font-mono font-bold text-[#C5A059]">
                          {formatCurrency(itemSubtotal)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Acquisition Summary Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-6 space-y-5">
                <h3 className="text-sm font-mono uppercase font-bold text-white tracking-widest border-b border-[#1a1a1a] pb-3">
                  Acquisition Summary
                </h3>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between text-white/60">
                    <span>Portfolio Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Privilege Discount ({appliedCoupon}):</span>
                      <span>- {formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>Insured Armored Transit:</span>
                    <span className="text-emerald-400 uppercase">Complimentary</span>
                  </div>
                  <div className="pt-3 border-t border-[#1a1a1a] flex justify-between text-base font-bold text-[#C5A059]">
                    <span>Total Acquisition:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* Voucher Code Form */}
                <form onSubmit={handleCouponSubmit} className="pt-2 border-t border-[#1a1a1a] space-y-2">
                  <span className="block text-[10px] font-mono uppercase text-white/50">
                    Privilege Voucher Code
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. MONO20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-black border border-[#2a2a2a] px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-[#C5A059]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white hover:bg-[#C5A059] text-black font-semibold text-xs font-mono uppercase transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-400 font-mono">{couponError}</p>
                  )}
                </form>

                <div className="pt-2">
                  <Link
                    href="/checkout"
                    className="block w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d48] text-black text-center font-bold text-xs font-mono tracking-widest uppercase transition-all shadow-lg hover:shadow-[#C5A059]/20"
                  >
                    Proceed to Protected Checkout →
                  </Link>
                </div>
              </div>

              {/* Guarantees note */}
              <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-4 text-[11px] font-mono text-white/50 space-y-1.5">
                <div className="flex items-center gap-2 text-[#C5A059] font-bold">
                  <span>✦</span>
                  <span className="uppercase tracking-wider">Krono Geneva Guarantee</span>
                </div>
                <p>Every piece includes serialized Swiss international warranty, tamper-evident security seal, and full transit insurance.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
