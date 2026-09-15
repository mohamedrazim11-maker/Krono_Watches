"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { createOrder } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { cart, grandTotal, subtotal, discountAmount, appliedCoupon, couponDiscountPercent, clearCart } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Colombo",
    postal_code: "00100",
    country: "Sri Lanka",
    wrist_size: "Standard (19cm)",
    special_instructions: "",
  });

  // Milestone 3: Route Protection & Return URL handling
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/checkout&unauthorized=true");
    }
  }, [isLoading, isAuthenticated, router]);

  // Pre-fill user data upon auth load
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center font-mono text-xs text-[#C5A059] animate-pulse">
            Verifying Protected Checkout Authentication...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const orderPayload = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city} ${formData.postal_code}, ${formData.country}`,
        total_amount: grandTotal,
        wrist_size: formData.wrist_size,
        gift_packaging: true,
        special_instructions: formData.special_instructions,
        coupon_code: appliedCoupon,
        coupon_discount_percent: couponDiscountPercent,
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          subtotal: item.product.price * item.quantity,
          image_url: item.product.image_url,
        })),
      };

      const res = await createOrder(orderPayload);
      if (res.success || res.order) {
        setOrderId(res.order?.order_number || res.order?.id || `KRO-${Date.now().toString().slice(-6)}`);
        setOrderConfirmed(true);
        clearCart();
      } else {
        setErrorMsg(res.message || "Could not process order. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Order submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-white/50 mb-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-white">Cart</Link>
            <span>/</span>
            <span className="text-[#C5A059]">Protected Checkout</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Insured Vault Checkout
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              Authenticated Session
            </span>
          </div>
        </div>

        {orderConfirmed ? (
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-semibold text-white mb-2">
              Acquisition Confirmed
            </h2>
            <p className="text-xs font-mono text-[#C5A059] mb-4">
              Order Reference: {orderId}
            </p>
            <p className="text-xs text-white/60 leading-relaxed mb-8">
              A courier tracking docket and certified Swiss warranty certificate have been issued to <span className="text-white font-mono">{formData.email}</span>. Armored carrier transit is now initialized.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/profile"
                className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all"
              >
                View in Client Profile
              </Link>
              <Link
                href="/catalog"
                className="px-6 py-2.5 border border-white/20 hover:border-white text-white text-xs font-mono tracking-wider uppercase rounded-lg transition-all"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-7 bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-serif font-medium text-white mb-1">
                Recipient & Delivery Dossier
              </h2>
              <p className="text-xs text-white/50 mb-6 font-mono">
                Verified delivery address for insured courier conveyance.
              </p>

              {errorMsg && (
                <div className="mb-6 p-3.5 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+94 77 123 4567"
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                      Wrist Sizing
                    </label>
                    <select
                      name="wrist_size"
                      value={formData.wrist_size}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="Standard (19cm)">Standard Sizing (19cm)</option>
                      <option value="Small (16cm - 17cm)">Small (16cm - 17cm)</option>
                      <option value="Medium (17.5cm - 18.5cm)">Medium (17.5cm - 18.5cm)</option>
                      <option value="Large (19.5cm - 21cm)">Large (19.5cm - 21cm)</option>
                      <option value="Unsized Factory Links">Unsized (All Factory Links Included)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Penthouse Suite, 42 Marina Boulevard"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                    Delivery Instructions / Concierge Notes
                  </label>
                  <textarea
                    rows={2}
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleChange}
                    placeholder="Deliver directly to private security desk..."
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full mt-4 py-3.5 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/25 disabled:opacity-50"
                >
                  {submitting ? "Securing Acquisition..." : `Confirm Acquisition • LKR ${grandTotal.toLocaleString()}`}
                </button>
              </form>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6">
                <h2 className="text-base font-serif font-medium text-white mb-4">
                  Vault Summary ({cart.length} {cart.length === 1 ? "Item" : "Items"})
                </h2>

                {cart.length === 0 ? (
                  <p className="text-xs text-white/40 font-mono py-4">No items in your cart.</p>
                ) : (
                  <div className="divide-y divide-white/10 max-h-80 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.product.id} className="py-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-black overflow-hidden relative flex-shrink-0 border border-white/10">
                          <SmoothImage
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white font-medium truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-white/50 font-mono">
                            Qty: {item.quantity} × LKR {item.product.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-xs font-mono text-[#C5A059] font-bold">
                          LKR {(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal:</span>
                    <span>LKR {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Privilege Discount ({appliedCoupon}):</span>
                      <span>- LKR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>Insured Armored Transit:</span>
                    <span className="text-emerald-400 uppercase">Complimentary</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-[#C5A059]">
                    <span>Total Acquisition:</span>
                    <span>LKR {grandTotal.toLocaleString()}</span>
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
