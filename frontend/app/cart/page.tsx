"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import { useCart } from "@/lib/CartContext";
import { useTheme } from "@/lib/ThemeContext";
import { getProductImage } from "@/lib/productImages";

const FREE_SHIPPING_THRESHOLD = 5000; // Free shipping on orders over LKR 5,000
const STANDARD_SHIPPING_FEE = 350;
const EXPRESS_SHIPPING_FEE = 650;

// Professional Vector SVG Micro-Icons
const IconTrash = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconCart = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const IconTruck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const IconLock = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconShield = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function CartPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    cart,
    isCartReady,
    totalItems,
    appliedCoupon,
    couponType,
    couponValue,
    specialOffers,
    updateQuantity,
    setQuantity,
    removeFromCart,
    removeMultipleFromCart,
    clearCart,
    addToCart,
    applyCoupon,
    removeCoupon,
    toastMessage,
    showToast,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showOffers, setShowOffers] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // 3. Selection & Subtotal: All items selected by default with 0-delay instant frame rendering
  const selectedCartItems = useMemo(() => {
    return cart.filter((item) => !deselectedIds.has(item.product.id));
  }, [cart, deselectedIds]);

  const selectedCount = selectedCartItems.length;
  const allSelected = cart.length > 0 && selectedCount === cart.length;
  const isPartiallySelected = selectedCount > 0 && selectedCount < cart.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setDeselectedIds(new Set(cart.map((item) => item.product.id)));
    } else {
      setDeselectedIds(new Set());
    }
  };

  const toggleSelectItem = (id: string) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRemoveSelected = () => {
    const idsToRemove = selectedCartItems.map((item) => item.product.id);
    if (idsToRemove.length === 0) return;
    removeMultipleFromCart(idsToRemove);
    setDeselectedIds(new Set());
  };

  const selectedSubtotal = useMemo(() => {
    return selectedCartItems.reduce(
      (sum, item) => sum + (Number(item.product.price) || 0) * (Number(item.quantity) || 0),
      0
    );
  }, [selectedCartItems]);

  const selectedItemCount = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedCartItems]);

  // 4. Calculate Total Price (Percentage & Fixed discount support)
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || couponValue <= 0) return 0;
    if (couponType === "fixed") {
      return Math.min(selectedSubtotal, couponValue);
    }
    return Math.round((selectedSubtotal * couponValue) / 100);
  }, [selectedSubtotal, appliedCoupon, couponType, couponValue]);

  // Shipping calculation
  const isFreeShipping = selectedSubtotal >= FREE_SHIPPING_THRESHOLD;
  const baseShippingFee =
    shippingMethod === "express"
      ? EXPRESS_SHIPPING_FEE
      : isFreeShipping
      ? 0
      : STANDARD_SHIPPING_FEE;

  const shippingFee = selectedSubtotal > 0 ? baseShippingFee : 0;
  const grandTotal = Math.max(0, selectedSubtotal - discountAmount + shippingFee);
  const kokoInstallment = grandTotal > 0 ? Math.round(grandTotal / 3) : 0;

  // Free shipping progress
  const freeShippingProgress = Math.min(
    100,
    Math.round((selectedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - selectedSubtotal);

  // 3. Coupon handling: Apply promotional codes
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput.trim());
    if (!success) {
      setCouponError("Invalid promo code. Check available Special Offers below or try ROYAL20.");
    } else {
      setCouponInput("");
    }
  };

  // 2. Update product quantities
  const handleQuantityChange = (productId: string, rawVal: string, stockCount?: number) => {
    const val = parseInt(rawVal, 10);
    if (isNaN(val)) return;
    const max = typeof stockCount === "number" ? stockCount : 999;
    const clamped = Math.max(1, Math.min(val, max));
    setQuantity(productId, clamped);
  };

  const handleStepQuantity = (productId: string, delta: number, currentQty: number, stockCount?: number) => {
    if (delta < 0 && currentQty <= 1) {
      removeFromCart(productId);
      return;
    }
    if (delta > 0 && typeof stockCount === "number" && currentQty >= stockCount) {
      showToast(`Maximum available stock (${stockCount}) reached.`);
      return;
    }
    updateQuantity(productId, delta);
  };

  // 5. Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (selectedCartItems.length === 0) {
      showToast("Please select at least one item to proceed to checkout.");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? "bg-[#07080A] text-white" : "bg-neutral-50 text-neutral-900"
      }`}
    >
      <Navbar cartCount={totalItems} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C5A059] text-black px-5 py-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-2xl">
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border ${
              isDark ? "bg-[#111318] border-[#222730] text-white" : "bg-white border-neutral-200 text-neutral-900"
            } space-y-4`}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl">
              <IconTrash className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base">Clear entire shopping cart?</h3>
              <p className="text-xs text-neutral-400">
                Are you sure you want to remove all {totalItems} items from your shopping cart? This cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className={`py-2.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  isDark ? "bg-[#1C2028] hover:bg-[#282E38] text-white" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="py-2.5 rounded-lg text-xs font-mono font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Header matching Slide 4: "Shopping Cart" */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
            isDark ? "border-[#1A1D24]" : "border-neutral-200"
          }`}
        >
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              Shopping Cart
            </h1>
            {isCartReady && (
              <span className={`text-xs sm:text-sm font-mono ${isDark ? "text-[#8E95A5]" : "text-neutral-500"}`}>
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <Link
              href="/catalog"
              className={`inline-flex items-center gap-1.5 transition-colors ${
                isDark ? "text-[#8E95A5] hover:text-[#C5A059]" : "text-neutral-600 hover:text-amber-600"
              }`}
            >
              <span>←</span>
              <span>Continue Shopping</span>
            </Link>

            {cart.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-neutral-400 hover:text-red-500 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {!isCartReady ? (
          <div
            className={`p-12 text-center text-xs font-mono rounded-xl border ${
              isDark ? "bg-[#0E1015] border-[#1E232B] text-[#8E95A5]" : "bg-white border-neutral-200 text-neutral-500"
            }`}
          >
            Restoring your cart…
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart State */
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
              <IconCart className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold uppercase tracking-tight">
                Your Shopping Cart is Empty
              </h2>
              <p className={`text-xs font-mono leading-relaxed ${isDark ? "text-[#8E95A5]" : "text-neutral-500"}`}>
                You have not added any calibres to your shopping cart yet. Browse our curated collection and add timepieces with a single click.
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
          /* Main 2-Column Grid: Items on Left, Order Summary on Right (matching Slide 4) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items List (Col Span 8) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Table / List Controls: Select All & Bulk Actions */}
              <div
                className={`flex items-center justify-between px-5 py-3 rounded-xl border ${
                  isDark ? "bg-[#0E1015] border-[#1E232B]" : "bg-white border-neutral-200 shadow-xs"
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-[#C5A059] focus:ring-[#C5A059] focus:ring-offset-0 cursor-pointer accent-[#C5A059]"
                  />
                  <span className="text-xs font-mono font-semibold">
                    Select All ({selectedCount}/{cart.length} items)
                  </span>
                </label>

                {selectedCount > 0 && selectedCount < cart.length && (
                  <button
                    type="button"
                    onClick={handleRemoveSelected}
                    className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                    <span>Remove Selected ({selectedCount})</span>
                  </button>
                )}
              </div>

              {/* Items Card Container */}
              <div
                className={`rounded-xl border divide-y overflow-hidden ${
                  isDark
                    ? "bg-[#0E1015] border-[#1E232B] divide-[#181B22]"
                    : "bg-white border-neutral-200 divide-neutral-100 shadow-sm"
                }`}
              >
                {cart.map((item) => {
                  const resolvedImg = getProductImage(item.product.id, item.product.image_url);
                  const isSelected = !deselectedIds.has(item.product.id);
                  const lineTotal = item.product.price * item.quantity;
                  const caseSize = item.product.case_size || "41mm";
                  const movement = item.product.movement || "Automatic";
                  const brandSpaced = (item.product.brand || "KRONO").toUpperCase();
                  const stockCount = item.product.stock_count;
                  const isLowStock = typeof stockCount === "number" && stockCount <= 5;
                  const isMaxStockReached = typeof stockCount === "number" && item.quantity >= stockCount;

                  return (
                    <div
                      key={item.product.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isSelected
                          ? isDark ? "hover:bg-[#12141B]" : "hover:bg-neutral-50"
                          : isDark ? "opacity-60 bg-[#090A0D]" : "opacity-60 bg-neutral-100/50"
                      }`}
                    >
                      {/* Left: Checkbox + Thumbnail + Product Meta */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Checkbox (matches Slide 4 mockup) */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.product.id)}
                          className="w-4 h-4 rounded text-[#C5A059] focus:ring-[#C5A059] cursor-pointer accent-[#C5A059] flex-shrink-0"
                          aria-label={`Select ${item.product.name}`}
                        />

                        {/* Product Image */}
                        <Link
                          href={`/products/${item.product.id}`}
                          className={`w-20 h-20 sm:w-22 sm:h-22 rounded-lg border overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 transition-opacity hover:opacity-80 ${
                            isDark ? "bg-[#14161C] border-[#262A33]" : "bg-neutral-100 border-neutral-200"
                          }`}
                        >
                          <SmoothImage
                            src={resolvedImg}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </Link>

                        {/* Details */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="text-[10px] font-mono tracking-widest uppercase text-[#C5A059] font-bold">
                            {brandSpaced}
                          </div>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="block text-sm font-semibold hover:text-[#C5A059] transition-colors truncate"
                          >
                            {item.product.name}
                          </Link>
                          <div
                            className={`text-xs font-mono ${
                              isDark ? "text-[#8E95A5]" : "text-neutral-500"
                            }`}
                          >
                            {caseSize} · {movement}
                          </div>
                          
                          {/* Unit price */}
                          <div className="text-xs font-mono font-medium text-neutral-400">
                            Unit Price: {formatCurrency(item.product.price)}
                          </div>

                          {/* Stock status indicator */}
                          {isLowStock && (
                            <div className="text-[10px] font-mono font-semibold text-amber-500 flex items-center gap-1">
                              <span>⚠</span>
                              <span>Only {stockCount} left in stock</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Quantity Stepper + Line Subtotal + Trash Icon (matching Slide 4) */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-0 border-neutral-800/40">
                        
                        {/* 2. Update product quantities: Stepper with direct numeric input */}
                        <div
                          className={`flex items-center rounded-lg border overflow-hidden ${
                            isDark ? "bg-[#14161C] border-[#262A33]" : "bg-neutral-100 border-neutral-300"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleStepQuantity(item.product.id, -1, item.quantity, stockCount)}
                            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm font-mono cursor-pointer"
                            title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>

                          {/* Editable quantity input */}
                          <input
                            type="number"
                            min="1"
                            max={stockCount || 999}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product.id, e.target.value, stockCount)}
                            className="w-10 text-center text-xs font-mono font-bold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label="Quantity"
                          />

                          <button
                            type="button"
                            disabled={isMaxStockReached}
                            onClick={() => handleStepQuantity(item.product.id, 1, item.quantity, stockCount)}
                            className={`w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm font-mono cursor-pointer ${
                              isMaxStockReached ? "opacity-30 cursor-not-allowed" : ""
                            }`}
                            title={isMaxStockReached ? "Max stock reached" : "Increase quantity"}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* 3. Line Subtotal: Unit Price x Quantity */}
                        <div className="text-right min-w-[120px]">
                          <div className="text-sm sm:text-base font-mono font-bold text-[#C5A059]">
                            {formatCurrency(lineTotal)}
                          </div>
                          <div className={`text-[10px] font-mono ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                            ({item.quantity} × {formatCurrency(item.product.price)})
                          </div>
                        </div>

                        {/* 1. Add and remove products: Trash Can Icon Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove product from cart"
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Free Shipping Progress Bar */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? "bg-[#0E1015] border-[#1E232B]" : "bg-white border-neutral-200 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="text-[#C5A059]"><IconTruck className="w-4 h-4" /></span>
                    <span>
                      {isFreeShipping
                        ? "You unlocked FREE Worldwide Insured Shipping!"
                        : `Add ${formatCurrency(amountNeededForFreeShipping)} more for FREE Insured Shipping`}
                    </span>
                  </span>
                  <span className="text-[#C5A059] font-bold">{freeShippingProgress}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-[#181B22]" : "bg-neutral-200"}`}>
                  <div
                    className="h-full bg-[#C5A059] transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: ORDER SUMMARY (Col Span 4) - Matching Slide 4 Mockup */}
            <div className="lg:col-span-4">
              <div
                className={`rounded-2xl p-6 sm:p-7 space-y-6 border shadow-xl sticky top-24 ${
                  isDark ? "bg-[#0E1015] border-[#282E38]" : "bg-white border-neutral-200"
                }`}
              >
                {/* Order Summary Header */}
                <div className="border-b border-neutral-800/60 pb-3 flex items-center justify-between">
                  <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                    ORDER SUMMARY
                  </h2>
                  <span className="text-xs font-mono text-neutral-400">
                    {selectedItemCount} items
                  </span>
                </div>

                {/* 3. Coupon and Discount System */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                      Promotional Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOffers((prev) => !prev)}
                      className="text-[11px] font-mono text-[#C5A059] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Special Offers ({specialOffers.length})</span>
                      <span>{showOffers ? "▲" : "▼"}</span>
                    </button>
                  </div>

                  {/* Promo Code Input */}
                  <form onSubmit={handleCouponSubmit} className="space-y-2">
                    <div
                      className={`flex rounded-lg border overflow-hidden focus-within:border-[#C5A059] transition-colors ${
                        isDark ? "bg-[#14161C] border-[#282E38]" : "bg-neutral-50 border-neutral-300"
                      }`}
                    >
                      <input
                        type="text"
                        placeholder="Promo code (e.g. ROYAL20)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-transparent px-3 py-2.5 text-xs font-mono uppercase focus:outline-none placeholder:text-neutral-500"
                      />
                      <button
                        type="submit"
                        className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border-l ${
                          isDark
                            ? "bg-[#1C2028] hover:bg-[#282E38] text-[#C5A059] border-[#282E38]"
                            : "bg-neutral-200 hover:bg-neutral-300 text-neutral-800 border-neutral-300"
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-400 font-mono">{couponError}</p>
                    )}
                  </form>

                  {/* Applied Coupon Card with Remove button */}
                  {appliedCoupon && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs font-mono text-emerald-300">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <div>
                          <div className="font-bold uppercase tracking-wider text-white">
                            {appliedCoupon}
                            <span className="ml-2 text-[10px] text-emerald-400 font-normal">
                              ({couponType === "fixed" ? `Fixed LKR ${couponValue.toLocaleString()} OFF` : `${couponValue}% OFF`})
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-400/80">
                            Saving {formatCurrency(discountAmount)} on this order
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="px-2 py-1 text-[10px] uppercase font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded border border-red-900/30 transition-colors cursor-pointer"
                        title="Remove coupon"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Special Offers List */}
                  {showOffers && (
                    <div className="p-3 bg-[#12141A] border border-[#282E38] rounded-xl space-y-2.5 mt-2 animate-fade-in">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold">
                        Available Special Offers &amp; Discounts
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {specialOffers.map((offer) => {
                          const isApplied = appliedCoupon === offer.code;
                          return (
                            <div
                              key={offer.code}
                              className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between gap-2 ${
                                isApplied
                                  ? "bg-emerald-950/30 border-emerald-500/50"
                                  : "bg-[#161822] border-[#222733] hover:border-[#C5A059]/50"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-white uppercase">{offer.code}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                      offer.type === "fixed"
                                        ? "bg-blue-950 text-blue-300 border border-blue-800"
                                        : "bg-amber-950 text-amber-300 border border-amber-800"
                                    }`}
                                  >
                                    {offer.type === "fixed" ? "Fixed Discount" : "Percentage Discount"}
                                  </span>
                                </div>
                                <div className="text-[11px] text-neutral-400 mt-0.5 truncate max-w-[210px]">
                                  {offer.description}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (isApplied) {
                                    removeCoupon();
                                  } else {
                                    applyCoupon(offer.code);
                                  }
                                }}
                                className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded transition-colors cursor-pointer shrink-0 ${
                                  isApplied
                                    ? "bg-emerald-500 text-black"
                                    : "bg-[#C5A059] hover:bg-[#D4AF37] text-black"
                                }`}
                              >
                                {isApplied ? "✓ Applied" : "Apply"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Method Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Delivery Speed
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setShippingMethod("standard")}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        shippingMethod === "standard"
                          ? "border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]"
                          : isDark
                          ? "border-[#222730] bg-[#14161C] text-neutral-400 hover:text-white"
                          : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black"
                      }`}
                    >
                      <div className="font-bold">Standard</div>
                      <div className="text-[10px] text-neutral-400">
                        {isFreeShipping ? "FREE" : formatCurrency(STANDARD_SHIPPING_FEE)}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingMethod("express")}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        shippingMethod === "express"
                          ? "border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]"
                          : isDark
                          ? "border-[#222730] bg-[#14161C] text-neutral-400 hover:text-white"
                          : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black"
                      }`}
                    >
                      <div className="font-bold">Express</div>
                      <div className="text-[10px] text-neutral-400">
                        {formatCurrency(EXPRESS_SHIPPING_FEE)} (Next Day)
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3 & 4. Subtotal & Total Price Calculation Breakdown */}
                <div className="space-y-3 text-xs font-mono border-t border-b border-neutral-800/40 py-4">
                  {/* 3. Subtotal */}
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Subtotal ({selectedItemCount} items)</span>
                    <span className="font-semibold text-white">{formatCurrency(selectedSubtotal)}</span>
                  </div>

                  {/* Promo Discount: Percentage and Fixed Discounts */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>
                        Discount ({appliedCoupon}
                        {couponType === "fixed"
                          ? ` · Fixed LKR ${couponValue.toLocaleString()}`
                          : ` · ${couponValue}%`}
                        )
                      </span>
                      <span>– {formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  {/* Shipping Fee */}
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Estimated Shipping</span>
                    <span className={shippingFee === 0 ? "text-emerald-400 font-semibold" : "text-white"}>
                      {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
                    </span>
                  </div>

                  {/* Tax Note */}
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Estimated VAT / Tax</span>
                    <span className="text-neutral-500">Included</span>
                  </div>

                  {/* 4. Total Price */}
                  <div className="pt-3 border-t border-neutral-800/60 flex justify-between items-baseline">
                    <span className="text-sm font-bold">Total Price</span>
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-[#C5A059]">
                        {formatCurrency(grandTotal)}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Or {formatCurrency(kokoInstallment)} × 3 with KOKO
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Proceed to checkout CTA */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    disabled={selectedCartItems.length === 0}
                    className="w-full py-4 bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed text-black text-center font-bold text-xs uppercase tracking-[0.18em] transition-all rounded-xl shadow-lg hover:shadow-[#C5A059]/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <span>→</span>
                  </button>

                  <Link
                    href="/checkout?step=payment"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-[#C5A059] text-center font-mono font-bold text-xs uppercase tracking-wider transition-all rounded-xl group"
                  >
                    <svg className="w-4 h-4 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Direct Payment Checkout</span>
                    <span className="text-[#C5A059] group-hover:translate-x-1 transition-transform">→</span>
                  </Link>

                  {/* Payment Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-[10px] font-mono text-neutral-400">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded">VISA</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded">Mastercard</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-[#C5A059]/40 rounded text-[#C5A059] font-bold">PayHere Secured</span>
                  </div>

                  {/* Trust Guarantees */}
                  <div className="text-center text-[10px] font-mono text-neutral-500 space-y-1.5 pt-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <IconLock className="w-3 h-3 text-[#C5A059]" />
                      <span>256-bit SSL Encrypted &amp; Secure Checkout</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <IconShield className="w-3 h-3 text-[#C5A059]" />
                      <span>2-Year Official Brand Warranty · 30-Day Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
