"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/api";
import SmoothImage from "@/components/SmoothImage";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  appliedCoupon: string;
  onApplyCoupon: (code: string) => boolean;
  couponDiscountPercent: number;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  couponDiscountPercent,
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const rawSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = Math.round((rawSubtotal * couponDiscountPercent) / 100);
  const grandTotal = Math.max(0, rawSubtotal - discountAmount);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    if (!couponInput.trim()) return;
    const success = onApplyCoupon(couponInput.trim());
    if (!success) {
      setCouponError("Invalid voucher code. Try MONO20");
    } else {
      setCouponInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0B1C15] border-l border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col h-full shadow-2xl animate-pageEnter">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] flex items-center justify-between bg-[#F8FAF9] dark:bg-[#06110D]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#006039] text-white flex items-center justify-center text-sm shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black font-display uppercase tracking-widest text-[#0F172A] dark:text-[#F8FAFC]">
                Your Portfolio
              </h2>
              <div className="text-[10px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase tracking-wider font-mono font-semibold">
                {totalItems} {totalItems === 1 ? "Timepiece" : "Timepieces"} Allocated
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              onClick={onClose}
              className="text-[10px] font-mono font-bold text-[#006039] dark:text-[#4ADE80] hover:underline uppercase tracking-wider"
            >
              Full View ↗
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1F4535] text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer font-bold text-xs"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Complimentary Courier Perk Bar */}
        <div className="px-5 py-2.5 bg-[#E8F5EE] dark:bg-[#11261D] border-b border-[#006039]/20">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#006039] dark:text-[#4ADE80]">
            <span className="flex items-center gap-1.5">
              <span>✦</span>
              <span>Insured Air Transit & Presentation Box</span>
            </span>
            <span className="uppercase text-[9px]">Included</span>
          </div>
          <div className="w-full bg-[#CBD5E1]/40 dark:bg-[#06110D] h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#006039] dark:bg-[#4ADE80] h-full w-full rounded-full"></div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#F8FAF9] dark:bg-[#11261D] border border-[#E2E8F0] dark:border-[#1F4535] flex items-center justify-center text-2xl text-[#006039]">
                ⏳
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider font-display">
                  Your Vault is Empty
                </h3>
                <p className="text-xs text-[#5A6D64] dark:text-[#CBD5E1] max-w-xs">
                  Select authentic Swiss & mechanical wristwatches to build your private collection.
                </p>
              </div>
              <Link
                href="/catalog"
                onClick={onClose}
                className="lux-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Explore Catalogue
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="rounded-2xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] p-3.5 flex gap-3.5 items-center justify-between bg-[#F8FAF9]/90 dark:bg-[#06110D]/90 hover:border-[#006039] transition shadow-sm group"
              >
                <div className="h-16 w-16 rounded-xl bg-white dark:bg-[#0B1C15] overflow-hidden p-1 flex-shrink-0 flex items-center justify-center border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] shadow-sm">
                  <SmoothImage
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="text-[9px] text-[#006039] dark:text-[#4ADE80] font-mono uppercase font-bold tracking-wider">
                    {item.product.brand || "Swiss Calibre"} • {item.product.category}
                  </div>
                  <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate font-display">
                    {item.product.name}
                  </h4>
                  <div className="text-xs font-bold text-[#006039] dark:text-[#4ADE80] font-num">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-[10px] text-[#5A6D64] hover:text-[#E11D48] transition font-mono font-bold"
                    title="Remove item"
                  >
                    ✕ Remove
                  </button>

                  <div className="flex items-center gap-2 bg-white dark:bg-[#11261D] border border-[#E2E8F0] dark:border-[#1F4535] rounded-xl px-2 py-0.5 text-xs shadow-sm">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white px-1.5 font-bold cursor-pointer"
                    >
                      −
                    </button>
                    <span className="font-mono text-[#0F172A] dark:text-[#F8FAFC] text-xs min-w-[14px] text-center font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white px-1.5 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] bg-[#F8FAF9] dark:bg-[#06110D] space-y-3.5">
            {/* Promo Code Form */}
            <form onSubmit={handleCouponSubmit} className="space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Privilege Code (e.g. MONO20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-white dark:bg-[#11261D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] uppercase placeholder-[#64748B] focus:outline-none focus:border-[#006039] font-mono shadow-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl lux-btn-secondary text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <div className="text-[10px] text-[#006039] dark:text-[#10B981] font-mono font-semibold flex items-center justify-between px-1">
                  <span>✓ Applied: {appliedCoupon} (-{couponDiscountPercent}%)</span>
                </div>
              )}
              {couponError && (
                <div className="text-[10px] text-[#E11D48] px-1 font-mono">{couponError}</div>
              )}
            </form>

            {/* Price Matrix */}
            <div className="space-y-1.5 text-xs border-t border-[#E5ECE8] dark:border-[#122B20] pt-3">
              <div className="flex justify-between text-[#475569] dark:text-[#CBD5E1]">
                <span>Subtotal ({totalItems} items)</span>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-num font-semibold">{formatCurrency(rawSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#006039] dark:text-[#10B981] font-mono font-semibold">
                  <span>Privilege Discount ({couponDiscountPercent}%)</span>
                  <span className="font-num">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#475569] dark:text-[#CBD5E1]">
                <span>Insured Door-to-Door Courier</span>
                <span className="text-[#006039] dark:text-[#10B981] font-mono font-bold">Complimentary</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] pt-2 border-t border-[#E5ECE8] dark:border-[#122B20]">
                <span>Total Valuation</span>
                <span className="text-[#006039] dark:text-[#4ADE80] font-num text-base font-black">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 rounded-xl lux-btn-primary text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <span>•</span>
              <span className="font-num">{formatCurrency(grandTotal)}</span>
              <span>→</span>
            </button>

            {/* Trust Badges Strip */}
            <div className="text-[10px] font-mono text-[#5A6D64] dark:text-[#8EAA9C] text-center flex items-center justify-center gap-2 pt-0.5">
              <span>🔒 256-Bit SSL Encrypted</span>
              <span>•</span>
              <span>5-Year Warranty</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
