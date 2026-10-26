"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import { useCart } from "@/lib/CartContext";
import { getProductImage } from "@/lib/productImages";
import { fetchProducts, Product } from "@/lib/api";

export default function CartPage() {
  const {
    cart,
    isCartReady,
    totalItems,
    subtotal,
    grandTotal,
    discountAmount,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    toastMessage,
    showToast,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [recommendedWatches, setRecommendedWatches] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts()
      .then((prods) => {
        if (prods && prods.length > 0) {
          // Filter out items already in cart, pick first 3
          const cartIds = new Set(cart.map((c) => c.product.id));
          const available = prods.filter((p) => !cartIds.has(p.id));
          setRecommendedWatches(available.slice(0, 3));
        }
      })
      .catch(() => {});
  }, [cart]);

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput.trim());
    if (!success) {
      setCouponError("Invalid promo code. Try MONO20 or ROYAL20");
    } else {
      setCouponInput("");
      showToast(`Promo code applied! 20% discount granted.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07080A] text-white selection:bg-[#C5A059] selection:text-black font-sans">
      <Navbar cartCount={totalItems} />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C5A059] text-black px-5 py-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-2xl">
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Title matching Page 1 Wireframe: "Shopping Cart 3 items" */}
        <div className="flex items-baseline justify-between border-b border-[#1A1D24] pb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
              Shopping Cart
            </h1>
            {isCartReady && (
              <span className="text-xs sm:text-sm font-mono text-[#8E95A5]">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-mono text-[#8E95A5] hover:text-red-400 uppercase tracking-wider transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {!isCartReady ? (
          <div className="bg-[#0E1015] border border-[#1E232B] p-12 text-center text-xs font-mono text-[#8E95A5]">
            Restoring your cart…
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-12 sm:p-20 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#15181F] border border-[#282E38] flex items-center justify-center text-2xl text-[#C5A059]">
              🛒
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white">
                Your Cart is Empty
              </h2>
              <p className="text-xs text-[#8E95A5] font-mono leading-relaxed">
                You have not added any watches to your shopping cart yet. Explore our curated calibres to begin.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-block px-8 py-3.5 bg-[#C5A059] text-black text-xs font-mono font-bold tracking-widest uppercase hover:bg-[#b08d48] transition-colors rounded-lg"
              >
                Browse Catalogue
              </Link>
            </div>
          </div>
        ) : (
          /* Wireframe 2-Column Structure: Items List on Left, Order Summary Box on Right */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl divide-y divide-[#181B22] overflow-hidden">
                {cart.map((item) => {
                  const resolvedImg = getProductImage(item.product.id, item.product.image_url);
                  const itemSubtotal = item.product.price * item.quantity;
                  const caseSize = item.product.case_size || "41mm";
                  const movement = item.product.movement || "Automatic";
                  const brandSpaced = (item.product.brand || "KRONO")
                    .toUpperCase()
                    .split("")
                    .join(" ");

                  return (
                    <div
                      key={item.product.id}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors hover:bg-[#12141B]/50"
                    >
                      {/* Left: Image & Product Details */}
                      <div className="flex items-center gap-5 min-w-0">
                        {/* Square Image Container */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#14161C] border border-[#262A33] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          <SmoothImage
                            src={resolvedImg}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Title, Brand & Specs */}
                        <div className="space-y-1 min-w-0">
                          <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#C5A059] font-bold">
                            {brandSpaced}
                          </div>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="block text-sm sm:text-base font-semibold text-white hover:text-[#C5A059] transition-colors truncate"
                          >
                            {item.product.name}
                          </Link>
                          <div className="text-xs font-mono text-[#8E95A5]">
                            {caseSize} · {movement}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper, Total Price, Remove Link */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-[#1A1D24]">
                        {/* Stepper matching wireframe: – qty + */}
                        <div className="flex items-center bg-[#14161C] border border-[#262A33] rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-[#8E95A5] hover:text-white transition-colors text-sm font-mono cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-[#8E95A5] hover:text-white transition-colors text-sm font-mono cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Subtotal */}
                        <div className="text-sm sm:text-base font-mono font-bold text-white min-w-[110px] text-right">
                          {formatCurrency(itemSubtotal)}
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-xs font-mono text-[#8E95A5] hover:text-red-400 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link matching Wireframe 1 */}
              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#8E95A5] hover:text-[#C5A059] transition-colors"
                >
                  <span>←</span>
                  <span>Continue shopping</span>
                </Link>
              </div>
            </div>

            {/* Right Column: ORDER SUMMARY matching Wireframe 1 */}
            <div className="lg:col-span-4">
              <div className="bg-[#0E1015] border border-[#282E38] rounded-xl p-6 sm:p-7 space-y-6 shadow-xl">
                {/* Header */}
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em] border-b border-[#1E232B] pb-3">
                  ORDER SUMMARY
                </h2>

                {/* Promo Code Input matching wireframe: Promo code [ Apply ] */}
                <form onSubmit={handleCouponSubmit} className="space-y-2">
                  <div className="flex bg-[#14161C] border border-[#282E38] rounded-lg overflow-hidden focus-within:border-[#C5A059] transition-colors">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white font-mono uppercase focus:outline-none placeholder:text-[#5E6573]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#1C2028] hover:bg-[#282E38] text-[#C5A059] font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border-l border-[#282E38]"
                    >
                      [ Apply ]
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-400 font-mono">{couponError}</p>
                  )}
                  {appliedCoupon && (
                    <p className="text-[11px] text-emerald-400 font-mono">
                      ✓ Promo code {appliedCoupon} applied (20% off)
                    </p>
                  )}
                </form>

                {/* Subtotal, Shipping, Total */}
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-[#8E95A5]">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">{formatCurrency(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({appliedCoupon})</span>
                      <span>- {formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#8E95A5]">
                    <span>Shipping</span>
                    <span className="text-white">Calculated at checkout</span>
                  </div>

                  <div className="pt-4 border-t border-[#1E232B] flex justify-between items-baseline text-sm font-bold text-white">
                    <span>Total</span>
                    <span className="text-base text-[#C5A059] font-mono">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* PROCEED TO CHECKOUT Button */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="block w-full py-3.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black text-center font-bold text-xs uppercase tracking-[0.15em] transition-all rounded-lg shadow-lg hover:shadow-[#C5A059]/20"
                  >
                    PROCEED TO CHECKOUT
                  </Link>

                  {/* Trust Notes matching Wireframe 1 */}
                  <div className="text-center text-[10px] font-mono text-[#6E7585] tracking-wider">
                    Secure payment · Warranty · Easy returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wireframe 1: YOU MAY ALSO LIKE Section */}
        {recommendedWatches.length > 0 && (
          <div className="pt-8 border-t border-[#1A1D24] space-y-6">
            <h3 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.25em]">
              YOU MAY ALSO LIKE
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommendedWatches.map((rec) => {
                const img = getProductImage(rec.id, rec.image_url);
                return (
                  <Link
                    key={rec.id}
                    href={`/products/${rec.id}`}
                    className="group bg-[#0E1015] border border-[#1E232B] hover:border-[#C5A059]/50 rounded-xl p-5 space-y-4 transition-all"
                  >
                    {/* Square Image Box */}
                    <div className="aspect-square w-full bg-[#14161C] border border-[#262A33] rounded-lg overflow-hidden p-4 flex items-center justify-center">
                      <SmoothImage
                        src={img}
                        alt={rec.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white group-hover:text-[#C5A059] transition-colors truncate">
                        {rec.name}
                      </div>
                      <div className="text-xs font-mono font-bold text-[#C5A059]">
                        {formatCurrency(rec.price)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
