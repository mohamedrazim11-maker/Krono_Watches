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
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0E1420] border-l border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] text-[#121826] dark:text-[#F8FAFC] flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#080B10]">
          <div>
            <h2 className="text-sm font-black font-display uppercase tracking-widest text-[#121826] dark:text-[#F8FAFC] flex items-center gap-2">
              <span>Shopping Cart</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            </h2>
            <div className="text-[10px] text-[#8C7B65] dark:text-[#A3937C] uppercase tracking-wider font-mono font-semibold">
              {totalItems} {totalItems === 1 ? "Item" : "Items"} in Vault Order
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              onClick={onClose}
              className="text-[10px] font-mono font-bold text-[#D4AF37] dark:text-[#E5C158] hover:underline uppercase tracking-wider mr-1"
            >
              Full View ↗
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E8E2D6] dark:border-[#1E293B] text-[#8C7B65] hover:text-[#121826] dark:hover:text-white transition cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Free Shipping Alert */}
        <div className="px-5 py-2 bg-[#ECFDF5] dark:bg-[#064E3B]/30 border-b border-[#10B981]/30 text-[11px] text-[#059669] dark:text-[#10B981] font-mono font-bold flex items-center justify-between">
          <span>✓ COMPLIMENTARY INSURED AIR TRANSIT</span>
          <span className="text-[9px] uppercase">GENÈVE COSC</span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="text-5xl text-[#D5CBBA] dark:text-[#1E293B]">⏳</div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#121826] dark:text-[#F8FAFC] uppercase tracking-wider font-display">
                  Your Vault is Empty
                </h3>
                <p className="text-xs text-[#8C7B65] dark:text-[#CBD5E1] max-w-xs">
                  Discover master-calibre timepieces in our curated horology vault.
                </p>
              </div>
              <Link
                href="/catalog"
                onClick={onClose}
                className="lux-btn-gold px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Browse Catalogue
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.14)] p-3 flex gap-3 items-center justify-between bg-[#FAF8F5]/80 dark:bg-[#080B10]/80 hover:border-[#D4AF37] transition shadow-sm"
              >
                <div className="h-14 w-14 rounded-xl bg-white dark:bg-[#0E1420] overflow-hidden p-1 flex-shrink-0 flex items-center justify-center border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] shadow-sm">
                  <SmoothImage
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#121826] dark:text-[#F8FAFC] truncate font-display">
                    {item.product.name}
                  </h4>
                  <div className="text-[10px] text-[#D4AF37] font-mono uppercase font-semibold">
                    {item.product.category}
                  </div>
                  <div className="text-xs font-bold text-[#121826] dark:text-[#F3E5AB] font-num pt-0.5">
                    {formatCurrency(item.product.price)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-[10px] text-[#8C7B65] hover:text-[#F43F5E] transition font-mono"
                  >
                    Remove
                  </button>

                  <div className="flex items-center gap-2 bg-white dark:bg-[#141D2E] border border-[#E8E2D6] dark:border-[#1E293B] rounded-lg px-2 py-0.5 text-xs shadow-sm">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="text-[#8C7B65] hover:text-[#121826] dark:hover:text-white px-1 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-[#121826] dark:text-[#F8FAFC] text-xs min-w-[12px] text-center font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="text-[#8C7B65] hover:text-[#121826] dark:hover:text-white px-1 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] bg-[#FAF8F5] dark:bg-[#080B10] space-y-3">
            <form onSubmit={handleCouponSubmit} className="space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Privilege Code (e.g. MONO20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-white dark:bg-[#141D2E] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] rounded-xl px-3.5 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] uppercase placeholder-[#8C7B65] focus:outline-none focus:border-[#D4AF37] font-mono shadow-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl lux-btn-secondary text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <div className="text-[10px] text-[#059669] dark:text-[#10B981] font-mono font-semibold flex items-center justify-between px-1">
                  <span>✓ Applied: {appliedCoupon} (-{couponDiscountPercent}%)</span>
                </div>
              )}
              {couponError && (
                <div className="text-[10px] text-[#F43F5E] px-1 font-mono">{couponError}</div>
              )}
            </form>

            <div className="space-y-1.5 text-xs border-t border-[#EBE5DB] dark:border-[#182234] pt-3">
              <div className="flex justify-between text-[#645A4C] dark:text-[#CBD5E1]">
                <span>Subtotal</span>
                <span className="text-[#121826] dark:text-[#F8FAFC] font-num font-semibold">{formatCurrency(rawSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#059669] dark:text-[#10B981] font-mono font-semibold">
                  <span>Privilege Discount ({couponDiscountPercent}%)</span>
                  <span className="font-num">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#645A4C] dark:text-[#CBD5E1]">
                <span>Insured Door Courier</span>
                <span className="text-[#059669] dark:text-[#10B981] font-mono font-bold">Complimentary</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#121826] dark:text-[#F8FAFC] pt-2 border-t border-[#EBE5DB] dark:border-[#182234]">
                <span>Total Valuation</span>
                <span className="text-[#121826] dark:text-[#F3E5AB] font-num text-base font-black">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 rounded-xl lux-btn-gold text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              Concierge Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
