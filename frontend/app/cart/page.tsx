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
  const [wristSize, setWristSize] = useState("Standard Factory (19cm)");
  const [giftBox, setGiftBox] = useState(true);
  const [specialNote, setSpecialNote] = useState("");

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
      showToast(`Privilege code applied!`);
    }
  };

  const handleMoveToWishlist = (product: any) => {
    if (!isInWishlist(product.id)) {
      toggleWishlist(product);
    }
    removeFromCart(product.id);
    showToast(`Moved ${product.name} to Wishlist.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E8EEF3] dark:bg-[#0E1A16] text-[#0F172A] dark:text-[#F8FAFC] selection:bg-[#006039] selection:text-white transition-colors duration-300">
      <Navbar />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 neu-raised-lg bg-[#006039] dark:bg-[#0E1A16] text-white px-5 py-3 rounded-2xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-3 animate-pageEnter">
          <span className="text-[#4ADE80]">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80] font-bold">
              <Link href="/" className="hover:underline">Boutique</Link>
              <span>/</span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC]">Horological Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight">
              Vault <span className="rolex-gradient-text">Portfolio</span>
            </h1>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#006039] dark:text-[#4ADE80] font-bold neu-raised-sm px-3.5 py-1.5 rounded-full">
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
          <div className="rounded-[2rem] neu-raised-lg p-10 sm:p-16 text-center space-y-5 shadow-xl">
            <div className="h-20 w-20 mx-auto rounded-3xl neu-inset flex items-center justify-center text-4xl text-[#006039] dark:text-[#4ADE80]">
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
                className="neu-btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs uppercase tracking-[0.15em] font-black transition"
              >
                <span>Browse Timepiece Catalogue</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items & Bespoke Options */}
            <div className="lg:col-span-8 space-y-6">
              {/* Product Items Table / List */}
              <div className="rounded-[2rem] neu-raised-lg overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#E8EEF3]/90 dark:bg-[#0E1A16]/90 border-b border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] text-[10px] font-mono uppercase font-bold text-[#5A6D64] dark:text-[#8EAA9C] tracking-wider">
                  <div className="col-span-6">Timepiece & Calibre</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                <div className="divide-y divide-[rgba(166,180,200,0.25)] dark:divide-[rgba(255,255,255,0.04)]">
                  {cart.map((item) => {
                    const lineTotal = item.product.price * item.quantity;
                    return (
                      <div
                        key={item.product.id}
                        className="p-5 sm:p-6 sm:grid sm:grid-cols-12 gap-4 items-center hover:bg-[rgba(166,180,200,0.15)] dark:hover:bg-[rgba(255,255,255,0.02)] transition"
                      >
                        {/* Timepiece Info */}
                        <div className="col-span-6 flex items-center gap-4">
                          <Link
                            href={`/products/${item.product.id}`}
                            className="h-20 w-20 rounded-2xl neu-inset p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden group"
                          >
                            <SmoothImage
                              src={item.product.image_url}
                              alt={item.product.name}
                              objectFit="contain"
                              className="group-hover:scale-105 transition-transform"
                              containerClassName="w-full h-full"
                            />
                          </Link>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 text-[9px] font-mono uppercase text-[#006039] dark:text-[#4ADE80] font-bold tracking-wider">
                              <span>{item.product.brand || "Swiss Manufacture"}</span>
                              <span>•</span>
                              <span>{item.product.category}</span>
                            </div>

                            <Link
                              href={`/products/${item.product.id}`}
                              className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#006039] transition font-display line-clamp-1 block"
                            >
                              {item.product.name}
                            </Link>

                            <div className="flex items-center gap-3 text-[10px] text-[#5A6D64] dark:text-[#8EAA9C] font-mono">
                              <span>{item.product.movement || "Swiss Calibre"}</span>
                              {item.product.case_size && <span>• {item.product.case_size}</span>}
                            </div>

                            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                              <button
                                onClick={() => handleMoveToWishlist(item.product)}
                                className="text-[#5A6D64] hover:text-[#006039] underline font-semibold cursor-pointer"
                              >
                                Save to Wishlist
                              </button>
                              <span>•</span>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-[#E11D48] hover:underline font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="hidden sm:block col-span-2 text-center text-xs font-bold text-[#475569] dark:text-[#CBD5E1] font-num">
                          {formatCurrency(item.product.price)}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="col-span-2 flex justify-center py-2 sm:py-0">
                          <div className="flex items-center gap-2 neu-inset rounded-2xl px-3 py-1 text-xs">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white px-1.5 py-0.5 font-bold cursor-pointer transition"
                              title="Decrease"
                            >
                              −
                            </button>
                            <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] min-w-[20px] text-center text-xs">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white px-1.5 py-0.5 font-bold cursor-pointer transition"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-2 text-right pt-2 sm:pt-0 flex items-center justify-between sm:justify-end">
                          <span className="sm:hidden text-xs text-[#5A6D64]">Subtotal:</span>
                          <span className="text-sm font-black text-[#006039] dark:text-[#4ADE80] font-num">
                            {formatCurrency(lineTotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bespoke Concierge Sizing & Packaging Box */}
              <div className="rounded-[2rem] neu-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pb-3">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                    <span className="text-[#006039] dark:text-[#4ADE80]">✦</span>
                    <span>Complimentary Concierge Adjustments</span>
                  </h3>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#006039] dark:text-[#4ADE80]">
                    Atelier Included
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-[#5A6D64] dark:text-[#8EAA9C] mb-1.5">
                      Bracelet Circumference Sizing
                    </label>
                    <select
                      value={wristSize}
                      onChange={(e) => setWristSize(e.target.value)}
                      className="w-full neu-inset rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none font-mono"
                    >
                      <option value="Standard Factory (19cm)">Standard Factory Bracelet (19cm)</option>
                      <option value="Custom Sized 16-17cm">Slim Wrist (16–17cm adjusted)</option>
                      <option value="Custom Sized 17.5-18.5cm">Medium Wrist (17.5–18.5cm adjusted)</option>
                      <option value="Custom Sized 19.5-21cm">Broad Wrist (19.5–21cm adjusted)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-[#5A6D64] dark:text-[#8EAA9C] mb-1.5">
                      Lacquered Hardwood Presentation Box
                    </label>
                    <div className="flex items-center gap-2.5 pt-2">
                      <input
                        type="checkbox"
                        id="cart_gift_box"
                        checked={giftBox}
                        onChange={(e) => setGiftBox(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#006039] cursor-pointer"
                      />
                      <label htmlFor="cart_gift_box" className="text-xs text-[#475569] dark:text-[#CBD5E1] cursor-pointer font-semibold">
                        Signature Green Lacquer Presentation Box & Certificate
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-[#5A6D64] dark:text-[#8EAA9C] mb-1.5">
                    Special Delivery Instructions / Dedication
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please include congratulatory envelope, private handover requested..."
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    className="w-full neu-inset rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                  />
                </div>
              </div>

              {/* Navigation Back */}
              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/catalog"
                  className="text-xs font-mono font-bold uppercase tracking-wider text-[#006039] dark:text-[#4ADE80] hover:underline transition flex items-center gap-1.5"
                >
                  <span>← Continue Discovering References</span>
                </Link>
                <span className="text-[11px] font-mono text-[#5A6D64] dark:text-[#8EAA9C]">
                  Insured air transit automatically included.
                </span>
              </div>
            </div>

            {/* Right Column: Sticky Investment Summary */}
            <div className="lg:col-span-4 space-y-4 sticky top-28">
              <div className="rounded-[2rem] neu-card p-6 space-y-5">
                <h3 className="text-sm font-black font-display uppercase tracking-widest text-[#0F172A] dark:text-[#F8FAFC] border-b border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pb-3 flex items-center gap-2">
                  <span>Investment Summary</span>
                  <span className="w-2 h-2 rounded-full bg-[#006039] dark:bg-[#4ADE80] animate-pulse"></span>
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
                      className="flex-1 neu-inset rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] uppercase placeholder-[#64748B] focus:outline-none font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl neu-btn text-xs font-bold cursor-pointer"
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
                <div className="space-y-2.5 text-xs border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-4">
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

                  <div className="flex justify-between text-[#475569] dark:text-[#CBD5E1]">
                    <span>5-Year Concierge Warranty</span>
                    <span className="text-[#006039] dark:text-[#10B981] font-mono font-bold">
                      Included
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] pt-3 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)]">
                    <span>Total Valuation</span>
                    <span className="text-[#006039] dark:text-[#4ADE80] font-num text-xl font-black">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-2xl neu-btn-primary text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </button>

                {/* Accepted Payment Strip */}
                <div className="border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-3 text-center space-y-2">
                  <div className="text-[9px] font-mono uppercase text-[#5A6D64] dark:text-[#8EAA9C] font-semibold">
                    Accepted Acquisition Methods
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-[#5A6D64] dark:text-[#CBD5E1] font-mono font-bold">
                    <span className="px-2.5 py-1 rounded-lg neu-inset">VISA</span>
                    <span className="px-2.5 py-1 rounded-lg neu-inset">MASTERCARD</span>
                    <span className="px-2.5 py-1 rounded-lg neu-inset">AMEX</span>
                    <span className="px-2.5 py-1 rounded-lg neu-inset">APPLE PAY</span>
                  </div>
                </div>
              </div>

              {/* Private Salon Assistance Card */}
              <div className="rounded-3xl neu-card p-5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold font-display">
                  <span className="text-[#006039] dark:text-[#4ADE80] text-base">✦</span>
                  <span>Need Concierge Guidance?</span>
                </div>
                <p className="text-[11px] text-[#5A6D64] dark:text-[#8EAA9C] leading-relaxed">
                  Our certified horologists are available to assist with custom sizing, payment options, and worldwide dispatch schedules.
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono font-bold text-[#006039] dark:text-[#4ADE80]">
                  <span>Geneva: +41 22 819 0000</span>
                  <span>London: +44 20 7499 0000</span>
                </div>
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
