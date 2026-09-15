"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/api";
import SmoothImage from "@/components/SmoothImage";
import { useCart } from "@/lib/CartContext";
import { getProductImage } from "@/lib/productImages";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart?: CartItem[];
  onUpdateQuantity?: (productId: string, delta: number) => void;
  onRemoveItem?: (productId: string) => void;
  onClearCart?: () => void;
  onProceedToCheckout?: () => void;
  onOpenCheckout?: () => void;
  appliedCoupon?: string;
  onApplyCoupon?: (code: string) => boolean;
  couponDiscountPercent?: number;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart: propCart,
  onUpdateQuantity: propUpdateQuantity,
  onRemoveItem: propRemoveItem,
  onProceedToCheckout: propProceedToCheckout,
  onOpenCheckout: propOpenCheckout,
  appliedCoupon: propAppliedCoupon,
  onApplyCoupon: propApplyCoupon,
  couponDiscountPercent: propCouponDiscountPercent,
}: CartDrawerProps) {
  const cartContext = useCart();

  const cart = propCart ?? cartContext.cart;
  const onUpdateQuantity = propUpdateQuantity ?? cartContext.updateQuantity;
  const onRemoveItem = propRemoveItem ?? cartContext.removeFromCart;
  const appliedCoupon = propAppliedCoupon ?? cartContext.appliedCoupon;
  const onApplyCoupon = propApplyCoupon ?? cartContext.applyCoupon;
  const couponDiscountPercent = propCouponDiscountPercent ?? cartContext.couponDiscountPercent;
  const handleProceed = propOpenCheckout ?? propProceedToCheckout ?? (() => cartContext.setIsCheckoutOpen(true));

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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div className="relative z-10 w-full max-w-md bg-[#0A0A0A] border-l border-[#1a1a1a] text-white flex flex-col h-full shadow-2xl animate-pageEnter font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-[#111] border border-[#2a2a2a] flex items-center justify-center text-[#C5A059]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Your Vault Portfolio
              </h2>
              <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
                {totalItems} {totalItems === 1 ? "Timepiece" : "Timepieces"} Allocated
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition cursor-pointer font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="text-4xl text-[#C5A059]">⏳</div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Portfolio is Empty
                </h3>
                <p className="text-xs text-white/50 max-w-xs font-mono">
                  Your vault portfolio does not contain any reserved references yet.
                </p>
              </div>
              <Link
                href="/catalog"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#C5A059] text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#b08d48]"
              >
                Explore Catalogue
              </Link>
            </div>
          ) : (
            cart.map((item) => {
              const img = getProductImage(item.product.id, item.product.image_url);
              return (
                <div
                  key={item.product.id}
                  className="bg-[#0D0D0D] border border-[#1a1a1a] p-3.5 flex gap-3.5 items-center justify-between"
                >
                  <div className="h-16 w-16 bg-black border border-white/10 overflow-hidden flex-shrink-0">
                    <SmoothImage
                      src={img}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[9px] font-mono uppercase text-[#C5A059] font-bold truncate">
                      {item.product.brand}
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {item.product.name}
                    </div>
                    <div className="text-xs font-mono font-bold text-[#C5A059]">
                      {formatCurrency(item.product.price)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center border border-[#2a2a2a] bg-[#111]">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="px-2 py-0.5 text-white/60 hover:text-white text-xs"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="px-2 py-0.5 text-white/60 hover:text-white text-xs"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
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

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#1a1a1a] bg-[#0D0D0D] space-y-4">
            {/* Voucher code */}
            <form onSubmit={handleCouponSubmit} className="space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="VOUCHER (e.g. MONO20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-black border border-[#2a2a2a] px-3 py-1.5 text-xs uppercase font-mono text-white focus:outline-none focus:border-[#C5A059]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white text-black text-xs font-mono font-bold uppercase hover:bg-[#C5A059]"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-400 font-mono">{couponError}</p>}
            </form>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-white/60">
                <span>Subtotal:</span>
                <span>{formatCurrency(rawSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({appliedCoupon}):</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/60">
                <span>Armored Transit:</span>
                <span className="text-emerald-400 uppercase">Complimentary</span>
              </div>
              <div className="pt-2 border-t border-[#1a1a1a] flex justify-between text-sm font-bold text-[#C5A059]">
                <span>Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                handleProceed();
              }}
              className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d48] text-black font-bold text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-[#C5A059]/20"
            >
              Proceed to Protected Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
