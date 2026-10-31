"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "@/lib/api";
import { useCart } from "@/lib/CartContext";

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
  onClearCart: propClearCart,
  onProceedToCheckout: propProceedToCheckout,
  onOpenCheckout: propOpenCheckout,
  couponDiscountPercent: propCouponDiscountPercent,
}: CartDrawerProps) {
  const cartContext = useCart();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Lock background webpage scrolling when cart drawer is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Ensure scroll position is at top whenever cart drawer opens or items change
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen, propCart?.length, cartContext.cart.length]);

  const cart = propCart ?? cartContext.cart;
  const onUpdateQuantity = propUpdateQuantity ?? cartContext.updateQuantity;
  const onRemoveItem = propRemoveItem ?? cartContext.removeFromCart;
  const onClearCart = propClearCart ?? cartContext.clearCart;
  const couponDiscountPercent = propCouponDiscountPercent ?? cartContext.couponDiscountPercent;

  if (!isOpen) return null;

  const handleProceed = () => {
    onClose();
    if (propProceedToCheckout) {
      propProceedToCheckout();
    } else if (propOpenCheckout) {
      propOpenCheckout();
    } else {
      router.push("/checkout");
    }
  };

  const handleDecrement = (productId: string, currentQty: number) => {
    if (currentQty <= 1) {
      onRemoveItem(productId);
    } else {
      onUpdateQuantity(productId, -1);
    }
  };

  const handleIncrement = (productId: string) => {
    onUpdateQuantity(productId, 1);
  };

  const formatPrice = (amount: number) => {
    return `Rs. ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const rawSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = Math.round((rawSubtotal * couponDiscountPercent) / 100);
  const grandTotal = Math.max(0, rawSubtotal - discountAmount);
  const kokoInstallment = grandTotal > 0 ? grandTotal / 3 : 0;

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end font-sans overscroll-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity overscroll-none"
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Slide-over Cart Drawer */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-[#F4F5F7] text-neutral-900 flex flex-col h-full shadow-2xl animate-pageEnter overscroll-contain">
        
        {/* Header (fixed at top, not overlapping navbar) */}
        <div className="flex-shrink-0 p-6 pb-4 flex items-center justify-between border-b border-neutral-200/80 bg-white">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Cart
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {cart.length > 0 && (
              <Link
                href="/checkout"
                onClick={handleProceed}
                className="text-xs font-bold text-[#C5A059] hover:text-black uppercase tracking-wider flex items-center gap-1 transition-colors underline decoration-[#C5A059]"
              >
                Checkout →
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer text-lg leading-none"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Cart Items */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-3 space-y-3 min-h-0 overscroll-contain">
          {!cartContext.isCartReady ? (
            <div className="h-full flex items-center justify-center text-xs text-neutral-500">
              Loading cart…
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm text-neutral-400">
                🛒
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">
                  Your cart is empty
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Looks like you haven&apos;t added any items yet.
                </p>
              </div>
              <Link
                href="/catalog"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#18181B] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
              >
                Browse Collection
              </Link>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = item.product.price * item.quantity;
              return (
                /* Item Card matching sample image */
                <div
                  key={item.product.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200/70 space-y-3"
                >
                  {/* Product Title */}
                  <h3 className="text-[13px] font-semibold text-neutral-900 leading-snug line-clamp-2">
                    {item.product.name}
                  </h3>

                  {/* Quantity & Item Price Row */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-neutral-500 font-medium">
                      Quantity: {item.quantity}
                    </span>
                    <span className="font-semibold text-neutral-900 text-sm">
                      {formatPrice(itemTotal)}
                    </span>
                  </div>

                  {/* Quantity Stepper (Trash/Minus on Left, Number in Center, Plus on Right) */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Trash/Decrement Button */}
                    <button
                      type="button"
                      onClick={() => handleDecrement(item.product.id, item.quantity)}
                      className="w-10 h-10 rounded-lg border border-neutral-300 bg-white flex items-center justify-center text-neutral-700 hover:bg-neutral-50 hover:text-red-600 transition-colors cursor-pointer shadow-xs"
                      title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>

                    {/* Quantity Number */}
                    <span className="text-sm font-semibold text-neutral-800 text-center flex-1">
                      {item.quantity}
                    </span>

                    {/* Increment Button */}
                    <button
                      type="button"
                      onClick={() => handleIncrement(item.product.id)}
                      className="w-10 h-10 rounded-lg border border-neutral-300 bg-white flex items-center justify-center text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer shadow-xs"
                      title="Increase quantity"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area: Total & Checkout (pinned at bottom, never pushed out) */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 p-6 pt-3 bg-[#F4F5F7] border-t border-neutral-300">
            {/* Total Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-base font-bold text-neutral-900">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Secured payment with PayHere at checkout (Cards, FriMi, Genie &amp; Online Banking).
              </p>
            </div>

            {/* Bottom Divider */}
            <div className="border-t border-neutral-300 my-4" />

            {/* Actions Row (Clear Cart Trash Can, VIEW CART, CHECKOUT) */}
            <div className="flex items-center justify-between gap-2.5">
              {/* Clear Cart Button */}
              <button
                type="button"
                onClick={onClearCart}
                className="p-2 text-neutral-700 hover:text-red-600 transition-colors cursor-pointer"
                title="Clear entire cart"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              <Link
                href="/cart"
                onClick={onClose}
                className="px-3.5 py-3.5 border border-neutral-300 hover:border-black text-neutral-800 hover:bg-neutral-100 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors text-center"
              >
                View Cart
              </Link>

              {/* Checkout Link / Button */}
              <Link
                href="/checkout"
                onClick={handleProceed}
                className="bg-[#18181B] hover:bg-black text-white font-bold text-xs tracking-wider uppercase px-5 py-3.5 rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer flex-1 text-center flex items-center justify-center gap-2"
              >
                <span>CHECKOUT</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
