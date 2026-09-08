"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustPillars from "@/components/TrustPillars";
import SmoothImage from "@/components/SmoothImage";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/lib/CartContext";

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
    applyCoupon,
    isCheckoutOpen,
    setIsCheckoutOpen,
    toastMessage,
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
      setCouponError("Invalid voucher code. Try MONO20 or ROYAL20");
    } else {
      setCouponInput("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white dark:selection:bg-amber-400 dark:selection:text-slate-950">
      <Navbar />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-bold mb-1">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">Home</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-amber-400">Shopping Cart</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
              Shopping <span className="text-slate-900 dark:text-amber-400 underline decoration-slate-300 dark:decoration-slate-700 decoration-2">Cart</span>
            </h1>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
                {totalItems} {totalItems === 1 ? "Item" : "Items"} Selected
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-red-500 font-mono transition cursor-pointer underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2A] p-10 sm:p-16 text-center space-y-5 shadow-sm">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl text-slate-400">
              🛒
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold font-display uppercase text-slate-900 dark:text-white">
                Your Shopping Cart is Empty
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                You have not added any master-calibre timepieces to your cart yet. Explore our curated Swiss catalogue to acquire a reference.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="lux-btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs uppercase tracking-[0.15em] font-black shadow-md hover:shadow-lg transition"
              >
                <span>Browse Timepiece Catalogue</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List (Step 2 - Dedicated View & Remove / Quantity Controls) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2A] divide-y divide-slate-100 dark:divide-slate-800/70 overflow-hidden shadow-sm">
                {cart.map((item) => {
                  const lineTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.product.id}`}
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700/80 p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden group shadow-sm"
                      >
                        <SmoothImage
                          src={item.product.image_url}
                          alt={item.product.name}
                          objectFit="contain"
                          className="group-hover:scale-105 transition-transform"
                          containerClassName="w-full h-full"
                        />
                      </Link>

                      {/* Title & Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">
                          <span>{item.product.brand || "Krono"}</span>
                          <span>•</span>
                          <span>{item.product.category}</span>
                        </div>

                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-amber-400 transition font-display truncate block"
                        >
                          {item.product.name}
                        </Link>

                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-num">
                          {formatCurrency(item.product.price)} <span className="text-[10px] text-slate-400 font-mono font-normal">/ unit</span>
                        </div>
                      </div>

                      {/* Quantity Controls (Step 2 - Quantity Up/Down & Edge Case Rule) */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-1.5 py-0.5 font-bold cursor-pointer transition text-sm"
                            title="Decrease quantity (removes if below 1)"
                          >
                            −
                          </button>
                          <span className="font-mono font-bold text-slate-900 dark:text-white min-w-[20px] text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-1.5 py-0.5 font-bold cursor-pointer transition text-sm"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[110px]">
                          <div className="text-sm font-black text-slate-900 dark:text-amber-400 font-num">
                            {formatCurrency(lineTotal)}
                          </div>
                          {/* Remove Button (Step 2 - Remove with filter()) */}
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[10px] text-red-500 hover:text-red-700 dark:hover:text-red-400 transition font-mono font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation CTA */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/catalog"
                  className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5"
                >
                  <span>← Continue Shopping</span>
                </Link>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Insured air transit automatically included.
                </span>
              </div>
            </div>

            {/* Order Summary & Live Totals (Step 2 - Live Total Calculation) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2A] p-5 sm:p-6 space-y-5 shadow-sm">
                <h3 className="text-sm font-black font-display uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  Order Summary
                </h3>

                {/* Promo Code Form */}
                <form onSubmit={handleCouponSubmit} className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
                    Privilege Voucher Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. MONO20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white uppercase placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-amber-400 font-mono shadow-inner"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl lux-btn-secondary text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold flex items-center justify-between pt-1">
                      <span>✓ Voucher Applied: {appliedCoupon} (-{couponDiscountPercent}%)</span>
                    </div>
                  )}
                  {couponError && (
                    <div className="text-[10px] text-red-500 px-1 font-mono">{couponError}</div>
                  )}
                </form>

                {/* Breakdown */}
                <div className="space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="text-slate-900 dark:text-white font-num font-semibold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                      <span>Privilege Discount ({couponDiscountPercent}%)</span>
                      <span className="font-num">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Insured Door-to-Door Courier</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                      Complimentary
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-sm font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span>Total Cost</span>
                    <span className="text-slate-900 dark:text-amber-400 font-num text-xl font-black">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl lux-btn-primary text-xs font-black uppercase tracking-widest cursor-pointer shadow-md hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </button>
              </div>

              {/* Security Guarantee Box */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131B2A]/50 p-4 space-y-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <span>🔒</span>
                  <span>Direct Atelier Concierge Guarantee</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  Every order includes COSC regulation certification, serialized authenticity card, and 5-year international movement warranty.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <TrustPillars />
      </main>

      <Footer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totalAmount={grandTotal}
        onClearCart={clearCart}
      />
    </div>
  );
}
