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
      setCouponError("Invalid privilege voucher code. Try MONO20 or ROYAL20");
    } else {
      setCouponInput("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] dark:bg-[#06110D] text-[#0F172A] dark:text-[#F8FAFC] selection:bg-[#006039] selection:text-white transition-colors duration-300">
      <Navbar />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00482B] dark:bg-[#0B1C15] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#006039] text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-3 animate-pageEnter">
          <span className="text-[#4ADE80]">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] pb-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80] font-bold mb-1">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC]">Vault Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight">
              Vault <span className="rolex-gradient-text">Portfolio</span>
            </h1>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#5A6D64] dark:text-[#8EAA9C] font-semibold">
                {totalItems} {totalItems === 1 ? "Piece" : "Pieces"} Allocated
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-[#5A6D64] hover:text-[#E11D48] font-mono transition cursor-pointer underline font-bold"
              >
                Clear Portfolio
              </button>
            </div>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] bg-gradient-to-br from-white via-[#F8FAF9] to-[#F1F5F3] dark:from-[#0B1C15] dark:via-[#06110D] dark:to-[#030806] p-10 sm:p-16 text-center space-y-5 shadow-xl">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-[#F8FAF9] dark:bg-[#11261D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] flex items-center justify-center text-4xl text-[#006039]">
              ⏳
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold font-display uppercase text-[#0F172A] dark:text-[#F8FAFC]">
                Your Horology Portfolio is Empty
              </h2>
              <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed font-sans">
                You have not reserved any master-calibre timepieces in your active portfolio yet. Explore our curated Swiss catalogue to allocate a reference.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="lux-btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs uppercase tracking-[0.15em] font-black shadow-lg hover:shadow-xl transition"
              >
                <span>Browse Timepiece Catalogue</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-3xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] bg-white dark:bg-[#0B1C15] divide-y divide-[#E5ECE8] dark:divide-[#122B20] overflow-hidden shadow-sm">
                {cart.map((item) => {
                  const lineTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-[#F8FAF9] dark:hover:bg-[#11261D]/50 transition"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.product.id}`}
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden group shadow-inner"
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
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#006039] dark:text-[#4ADE80] font-bold">
                          <span>{item.product.brand || "Krono"}</span>
                          <span>•</span>
                          <span>{item.product.category}</span>
                        </div>

                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#006039] transition font-display truncate block"
                        >
                          {item.product.name}
                        </Link>

                        <div className="text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] font-num">
                          {formatCurrency(item.product.price)} <span className="text-[10px] text-[#5A6D64] font-mono font-normal">/ unit</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5ECE8] dark:border-[#122B20]">
                        <div className="flex items-center gap-2 bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[#1F4535] rounded-xl px-2.5 py-1 text-xs shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white px-1.5 py-0.5 font-bold cursor-pointer transition text-sm"
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] min-w-[20px] text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white px-1.5 py-0.5 font-bold cursor-pointer transition text-sm"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[110px]">
                          <div className="text-sm font-black text-[#006039] dark:text-[#4ADE80] font-num">
                            {formatCurrency(lineTotal)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[10px] text-[#E11D48] hover:underline transition font-mono font-bold uppercase tracking-wider cursor-pointer"
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
                  className="text-xs font-mono font-bold uppercase tracking-wider text-[#006039] dark:text-[#4ADE80] hover:underline transition flex items-center gap-1.5"
                >
                  <span>← Explore More References</span>
                </Link>
                <span className="text-[11px] font-mono text-[#5A6D64] dark:text-[#8EAA9C]">
                  Insured air transit automatically included.
                </span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] bg-gradient-to-br from-white via-[#F8FAF9] to-[#F1F5F3] dark:from-[#0B1C15] dark:via-[#06110D] dark:to-[#030806] p-6 space-y-5 shadow-md">
                <h3 className="text-sm font-black font-display uppercase tracking-widest text-[#0F172A] dark:text-[#F8FAFC] border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] pb-3 flex items-center gap-2">
                  <span>Investment Summary</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006039] dark:bg-[#4ADE80]"></span>
                </h3>

                {/* Promo Code Form */}
                <form onSubmit={handleCouponSubmit} className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#5A6D64] dark:text-[#8EAA9C] font-bold block">
                    Privilege Voucher Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. MONO20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-white dark:bg-[#11261D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] uppercase placeholder-[#64748B] focus:outline-none focus:border-[#006039] font-mono shadow-inner"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl lux-btn-secondary text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="text-[10px] text-[#006039] dark:text-[#10B981] font-mono font-semibold flex items-center justify-between pt-1">
                      <span>✓ Voucher Applied: {appliedCoupon} (-{couponDiscountPercent}%)</span>
                    </div>
                  )}
                  {couponError && (
                    <div className="text-[10px] text-[#E11D48] px-1 font-mono">{couponError}</div>
                  )}
                </form>

                {/* Breakdown */}
                <div className="space-y-2.5 text-xs border-t border-[#E5ECE8] dark:border-[#122B20] pt-4">
                  <div className="flex justify-between text-[#475569] dark:text-[#CBD5E1]">
                    <span>Subtotal ({totalItems} pieces)</span>
                    <span className="text-[#0F172A] dark:text-[#F8FAFC] font-num font-semibold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#006039] dark:text-[#10B981] font-mono font-semibold">
                      <span>Privilege Discount ({couponDiscountPercent}%)</span>
                      <span className="font-num">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#475569] dark:text-[#CBD5E1]">
                    <span>Insured Door-to-Door Courier</span>
                    <span className="text-[#006039] dark:text-[#10B981] font-mono font-bold">
                      Complimentary
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] pt-3 border-t border-[#E5ECE8] dark:border-[#122B20]">
                    <span>Total Valuation</span>
                    <span className="text-[#006039] dark:text-[#4ADE80] font-num text-xl font-black">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl lux-btn-primary text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </button>
              </div>

              {/* Security Guarantee Box */}
              <div className="rounded-2xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] bg-white dark:bg-[#0B1C15] p-4 space-y-2 text-[11px] text-[#5A6D64] dark:text-[#CBD5E1] font-mono shadow-sm">
                <div className="flex items-center gap-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold">
                  <span className="text-[#006039] dark:text-[#4ADE80]">🔒</span>
                  <span>Direct Atelier Concierge Guarantee</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  Every order includes Superlative Chronometer certification, serialized authenticity card, and 5-year international movement warranty.
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
