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
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#131B2A] border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#0B0F17]/80">
          <div>
            <h2 className="text-sm font-black font-display uppercase tracking-widest text-slate-900 dark:text-white">Shopping Cart</h2>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono font-semibold">
              {totalItems} {totalItems === 1 ? "Item" : "Items"} Selected
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              onClick={onClose}
              className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-amber-400 uppercase tracking-wider underline mr-1"
            >
              Full Cart ↗
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Free Shipping Alert */}
        <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-400 font-mono font-semibold flex items-center justify-between">
          <span>✓ COMPLIMENTARY INSURED AIR TRANSIT</span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="text-4xl text-slate-300 dark:text-slate-700">🛒</div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">Shopping Cart is Empty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  Inspect master-calibre timepieces in our curated catalogue.
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
            cart.map((item) => (
              <div
                key={item.product.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 flex gap-3 items-center justify-between bg-slate-50/50 dark:bg-[#0B0F17]/50 hover:bg-slate-50 dark:hover:bg-[#0B0F17] transition"
              >
                <div className="h-14 w-14 rounded-xl bg-white dark:bg-[#131B2A] overflow-hidden p-1 flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                  <SmoothImage
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
                    {item.product.name}
                  </h4>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase font-semibold">
                    {item.product.category}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-amber-400 font-num pt-0.5">
                    {formatCurrency(item.product.price)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-[10px] text-slate-400 hover:text-red-500 transition font-mono"
                  >
                    Remove
                  </button>

                  <div className="flex items-center gap-2 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-xs shadow-sm">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-1 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-slate-900 dark:text-white text-xs min-w-[12px] text-center font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-1 font-bold"
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
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0B0F17]/80 space-y-3">
            <form onSubmit={handleCouponSubmit} className="space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Privilege Code (e.g. MONO20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white uppercase placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-amber-400 font-mono shadow-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl lux-btn-secondary text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold flex items-center justify-between px-1">
                  <span>✓ Applied: {appliedCoupon} (-{couponDiscountPercent}%)</span>
                </div>
              )}
              {couponError && (
                <div className="text-[10px] text-red-500 px-1 font-mono">{couponError}</div>
              )}
            </form>

            <div className="space-y-1 text-xs border-t border-slate-200 dark:border-slate-800 pt-2.5">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900 dark:text-white font-num font-semibold">{formatCurrency(rawSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                  <span>Privilege Discount ({couponDiscountPercent}%)</span>
                  <span className="font-num">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Insured Door Courier</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold">Complimentary</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800">
                <span>Total Investment</span>
                <span className="text-slate-900 dark:text-amber-400 font-num text-base font-black">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 rounded-xl lux-btn-primary text-xs font-black uppercase tracking-widest cursor-pointer shadow-md hover:shadow-lg transition"
            >
              Concierge Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
