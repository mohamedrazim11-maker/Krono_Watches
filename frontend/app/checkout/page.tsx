"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { createOrder, fetchOrderById } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import PayHereForm from "@/components/PayHereForm";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const paymentWasCancelled = searchParams.get("payment") === "cancelled";
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const {
    cart,
    isCartReady,
    grandTotal,
    subtotal,
    discountAmount,
    appliedCoupon,
    couponDiscountPercent,
    clearCart,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<"payhere" | "wire" | "cod">("payhere");
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState("payhere");
  const [errorMsg, setErrorMsg] = useState("");
  const [cancelMsg, setCancelMsg] = useState("");
  const [cancelDismissed, setCancelDismissed] = useState(false);
  const [activeStep, setActiveStep] = useState<"details" | "payhere">("details");

  // Inline auth gate states
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

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

  // Restore saved form state from sessionStorage if returning
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("krono_checkout_form");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  // Pre-fill user data upon auth load
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
      }));
    }
  }, [user]);

  // A browser redirect is not proof of payment; only the server notification can settle an order.
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const paramOrderId = searchParams.get("order_id");

    if (paymentStatus === "success" && paramOrderId) {
      let isCurrent = true;
      let retryTimer: ReturnType<typeof setTimeout> | undefined;
      const verifyPayment = async (attempt: number) => {
        try {
          const order = await fetchOrderById(paramOrderId);
          if (!isCurrent) return;
          setOrderId(paramOrderId);
          setConfirmedPaymentMethod("payhere");
          if (order.payment_status === "paid") {
            setOrderConfirmed(true);
            clearCart();
            return;
          }

          if (
            (order.payment_status === "cancelled" || order.payment_status === "failed") ||
            attempt >= 14
          ) {
            setCancelMsg(
              order.payment_status === "cancelled" || order.payment_status === "failed"
                ? "PayHere did not approve this payment. Your cart is unchanged and you can retry checkout."
                : "PayHere returned to the store, but confirmation is still pending. Your cart is unchanged; refresh this page to check again."
            );
            return;
          }

          retryTimer = setTimeout(() => {
            void verifyPayment(attempt + 1);
          }, 2000);
        } catch (error: unknown) {
          if (!isCurrent) return;
          setErrorMsg(
            error instanceof Error
              ? error.message
              : "Unable to verify your payment. Your cart is unchanged."
          );
        }
      };

      void verifyPayment(0);
      return () => {
        isCurrent = false;
        if (retryTimer) clearTimeout(retryTimer);
      };
    }
  }, [searchParams, clearCart]);

  if (isLoading || !isCartReady) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center font-mono text-xs text-[#C5A059] animate-pulse">
            {isLoading ? "Verifying Protected Checkout Authentication..." : "Restoring Your Cart..."}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [e.target.name]: e.target.value };
      try {
        sessionStorage.setItem("krono_checkout_form", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const executeOrderPlacement = async (activeUser?: any) => {
    const currentName = formData.name || activeUser?.name || user?.name || "Valued Client";
    const currentEmail = formData.email || activeUser?.email || user?.email || "";
    const currentPhone = formData.phone || activeUser?.phone || user?.phone || "";
    const currentAddress = formData.address || activeUser?.address || user?.address || "";

    // If customer selected PayHere, register order in DB as pending and proceed to PayHere Gateway step
    if (paymentMethod === "payhere") {
      // Reuse a pending order when a customer returns to the payment step.
      if (orderId) {
        setActiveStep("payhere");
        return;
      }
      setSubmitting(true);
      try {
        const orderPayload = {
          user_id: user?.id || null,
          customer_name: currentName,
          customer_email: currentEmail,
          customer_phone: currentPhone,
          shipping_address: `${currentAddress}, ${formData.city} ${formData.postal_code}, ${formData.country}`,
          city: formData.city,
          postal_code: formData.postal_code,
          country: formData.country,
          total_amount: grandTotal,
          subtotal: subtotal,
          discount_amount: discountAmount,
          wrist_size: formData.wrist_size,
          gift_packaging: true,
          special_instructions: formData.special_instructions,
          coupon_code: appliedCoupon,
          coupon_discount_percent: couponDiscountPercent,
          payment_method: "payhere",
          payment_status: "pending",
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
        const resolvedId = res?.order_number || res?.id;
        if (!resolvedId) throw new Error("The order could not be initialized.");
        setOrderId(resolvedId);
        setActiveStep("payhere");
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to initialize checkout order.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Direct alternative payment methods (Wire / COD)
    setSubmitting(true);
    try {
      const orderPayload = {
        user_id: user?.id || null,
        customer_name: currentName,
        customer_email: currentEmail,
        customer_phone: currentPhone,
        shipping_address: `${currentAddress}, ${formData.city} ${formData.postal_code}, ${formData.country}`,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        total_amount: grandTotal,
        subtotal: subtotal,
        discount_amount: discountAmount,
        wrist_size: formData.wrist_size,
        gift_packaging: true,
        special_instructions: formData.special_instructions,
        coupon_code: appliedCoupon,
        coupon_discount_percent: couponDiscountPercent,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "wire" ? "pending_transfer" : "cash_on_delivery",
        status: paymentMethod === "cod" ? "Pending" : "Pending",
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
      const resolvedId = res?.order_number || res?.id;
      if (!resolvedId) throw new Error("The order could not be created.");
      setOrderId(resolvedId);
      setConfirmedPaymentMethod(paymentMethod);
      setOrderConfirmed(true);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || "Order submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetailsProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    setErrorMsg("");

    // Accounts are optional: shoppers can complete a standard guest checkout.
    await executeOrderPlacement(user);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!authEmail.trim() || !authPassword) {
      setAuthError("Email and password are required.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await login(authEmail.trim(), authPassword);
      if (res.success && res.user) {
        setShowAuthGate(false);
        await executeOrderPlacement(res.user);
      } else {
        setAuthError(res.message || "Invalid credentials. Please verify your email and password.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Sign in failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const itemsSummaryString = cart.map((item) => `${item.product.name} (x${item.quantity})`).join(", ");

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        {/* Breadcrumb Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-white/50 mb-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-white">Cart</Link>
            <span>/</span>
            <span className="text-[#C5A059]">Checkout</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Secure Checkout
              </h1>
              {isAuthenticated ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  Verified Client Session ({user?.name ? user.name.split(" ")[0] : "Active"})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-amber-950/60 border border-amber-500/40 text-amber-300">
                  Guest checkout available
                </span>
              )}
            </div>

            {/* Stepper Indicator */}
            {!orderConfirmed && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span
                  onClick={() => setActiveStep("details")}
                  className={`cursor-pointer px-3 py-1 rounded-full border transition-all ${
                    activeStep === "details"
                      ? "bg-[#C5A059] text-black border-[#C5A059] font-bold"
                      : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                  }`}
                >
                  1. Delivery Address
                </span>
                <span className="text-white/20">→</span>
                <span
                  className={`px-3 py-1 rounded-full border transition-all ${
                    activeStep === "payhere"
                      ? "bg-[#C5A059] text-black border-[#C5A059] font-bold"
                      : "bg-white/5 text-white/40 border-white/10"
                  }`}
                >
                  2. PayHere Payment
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cancellation Alert */}
        {(cancelMsg || (paymentWasCancelled && !cancelDismissed)) && !orderConfirmed && (
          <div className="mb-6 p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start justify-between gap-3 text-xs text-amber-200 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-base">⚠️</span>
              <span>
                {cancelMsg ||
                  "PayHere payment was cancelled. Your items remain in your cart; you can retry payment or choose another payment method below."}
              </span>
            </div>
            <button
              onClick={() => {
                setCancelMsg("");
                setCancelDismissed(true);
              }}
              className="text-amber-400/60 hover:text-amber-300 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Order Confirmed View */}
        {orderConfirmed ? (
          <div className="bg-[#0D0D0D] border border-[#C5A059]/40 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-[#C5A059] shadow-lg shadow-[#C5A059]/20">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold mb-3 inline-block">
              {confirmedPaymentMethod === "payhere" ? "PayHere Transaction Settled" : "Order Confirmed"}
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
              Order Confirmed
            </h2>
            <p className="text-xs font-mono text-[#C5A059] mb-4">
              Order Reference ID: <span className="font-bold underline">{orderId}</span>
            </p>

            <div className="p-4 bg-black/60 border border-white/10 rounded-xl max-w-md mx-auto mb-6 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between text-white/60">
                <span>Payment Method:</span>
                <span className="text-white font-bold uppercase">
                  {confirmedPaymentMethod === "payhere" ? "PayHere Gateway (LKR Verified)" : confirmedPaymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Security Clearance:</span>
                <span className="text-emerald-400 font-bold">Passed (MD5 Certified)</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Confirmation Email:</span>
                <span className="text-white">{formData.email || user?.email}</span>
              </div>
            </div>

            <p className="text-xs text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">
              Your order tracking details and manufacturer warranty certificate have been registered. Insured delivery is now scheduled to <strong className="text-white">{formData.city || "Colombo"}</strong>.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/profile"
                className="px-6 py-3 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all shadow-lg shadow-[#C5A059]/20"
              >
                View in Client Profile →
              </Link>
              <Link
                href="/catalog"
                className="px-6 py-3 border border-white/20 hover:border-white text-white text-xs font-mono tracking-wider uppercase rounded-lg transition-all"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form or PayHere Step */}
            <div className="lg:col-span-7 space-y-6">
              {activeStep === "details" ? (
                <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-lg font-serif font-medium text-white mb-1">
                    Delivery Address &amp; Contact Details
                  </h2>
                  <p className="text-xs text-white/50 mb-6 font-mono">
                    Enter your shipping address for secure courier delivery.
                  </p>

                  {errorMsg && (
                    <div className="mb-6 p-3.5 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 font-mono">
                      {errorMsg}
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="mb-6 p-4 rounded-xl bg-[#141414] border border-[#C5A059]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                      <div className="flex items-start gap-3">
                        <span className="text-[#C5A059] text-base mt-0.5">🔒</span>
                        <div>
                          <span className="text-white font-bold block text-xs">
                            Checking out as a guest?
                          </span>
                          <span className="text-white/60 text-[11px] block mt-0.5">
                            You can place this order now. Sign in only for saved addresses and order history.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthEmail(formData.email || "");
                          setShowAuthGate(true);
                        }}
                        className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d48] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all text-center whitespace-nowrap self-start sm:self-auto"
                      >
                        Sign In
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleDetailsProceed} className="space-y-4">
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
                          placeholder="e.g. Lord Sterling"
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
                          placeholder="e.g. collector@krono.luxury"
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

                    {/* Payment Method Selector */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <label className="block text-xs uppercase tracking-wider text-[#C5A059] font-mono font-bold">
                        Select Payment Method *
                      </label>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Option 1: PayHere Payment Gateway */}
                        <div
                          onClick={() => setPaymentMethod("payhere")}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                            paymentMethod === "payhere"
                              ? "bg-[#C5A059]/10 border-[#C5A059] shadow-lg shadow-[#C5A059]/10"
                              : "bg-black/40 border-white/10 hover:border-white/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={paymentMethod === "payhere"}
                            onChange={() => setPaymentMethod("payhere")}
                            className="mt-1 accent-[#C5A059]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-sm text-white">
                                PayHere Payment Gateway (Cards / Wallets / Online Banking)
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Recommended • Instant
                              </span>
                            </div>
                            <p className="text-xs text-white/60 font-mono mt-1">
                              Supports Visa, MasterCard, AMEX, Genie, eZ Cash, and Sri Lankan banking channels.
                            </p>
                          </div>
                        </div>

                        {/* Option 2: Bank Transfer */}
                        <div
                          onClick={() => setPaymentMethod("wire")}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                            paymentMethod === "wire"
                              ? "bg-[#C5A059]/10 border-[#C5A059]"
                              : "bg-black/40 border-white/10 hover:border-white/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={paymentMethod === "wire"}
                            onChange={() => setPaymentMethod("wire")}
                            className="mt-1 accent-[#C5A059]"
                          />
                          <div className="flex-1">
                            <span className="font-serif font-bold text-sm text-white block">
                              Direct Bank Transfer (Wire / SLIPS)
                            </span>
                            <p className="text-xs text-white/50 font-mono mt-1">
                              Receive bank details for direct transfer or online banking deposit.
                            </p>
                          </div>
                        </div>

                        {/* Option 3: Cash on Delivery */}
                        <div
                          onClick={() => setPaymentMethod("cod")}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                            paymentMethod === "cod"
                              ? "bg-[#C5A059]/10 border-[#C5A059]"
                              : "bg-black/40 border-white/10 hover:border-white/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="mt-1 accent-[#C5A059]"
                          />
                          <div className="flex-1">
                            <span className="font-serif font-bold text-sm text-white block">
                              Cash on Delivery (Insured Courier)
                            </span>
                            <p className="text-xs text-white/50 font-mono mt-1">
                              Pay in cash when your order is delivered to your doorstep.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || authLoading || cart.length === 0}
                      className="w-full mt-6 py-4 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting || authLoading ? (
                        "Processing Order..."
                      ) : paymentMethod === "payhere" ? (
                        `Continue to PayHere • LKR ${grandTotal.toLocaleString()}`
                      ) : (
                        `Place Order • LKR ${grandTotal.toLocaleString()}`
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* Step 2: PayHere Gateway Component with slide-compliant form and hash calculator */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveStep("details")}
                      className="text-xs font-mono text-[#C5A059] hover:underline flex items-center gap-1"
                    >
                      ← Back to Delivery Details
                    </button>
                    <span className="text-xs font-mono text-white/40">Step 2 of 2</span>
                  </div>

                  <PayHereForm
                    orderId={orderId}
                    amount={grandTotal}
                    currency="LKR"
                    itemsDescription={itemsSummaryString}
                    customer={{
                      fullName: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      address: formData.address,
                      city: formData.city,
                      country: formData.country,
                    }}
                    isSubmitting={submitting}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Order & Cart Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6">
                <h2 className="text-base font-serif font-medium text-white mb-4">
                  Order Summary ({cart.length} {cart.length === 1 ? "Item" : "Items"})
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
                      <span>Discount ({appliedCoupon}):</span>
                      <span>- LKR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>Insured Delivery:</span>
                    <span className="text-emerald-400 uppercase">Free</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-[#C5A059]">
                    <span>Total Amount:</span>
                    <span>LKR {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Secure Badge */}
                <div className="mt-6 p-3 bg-black/60 border border-white/10 rounded-xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] text-xs">
                    🛡️
                  </div>
                  <div className="text-[11px] font-mono text-white/60 leading-tight">
                    PayHere 256-Bit SSL Encrypted Payment &amp; Manufacturer Warranty Backing.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Gate Modal: Mandatory Sign-In before final order placement */}
      {showAuthGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setShowAuthGate(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-[#0D0D0D] border border-[#C5A059]/40 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-5 animate-pageEnter">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-[#C5A059] text-sm">
                  🔒
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-white">
                    Sign In to Krono
                  </h3>
                  <p className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider">
                    Sign-In Required for Order Placement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthGate(false)}
                className="text-white/50 hover:text-white font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60 font-mono leading-relaxed">
              To record your international warranty certificate, track delivery dispatch, and secure your order, please sign in with your account credentials.
            </p>

            {authError && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-mono rounded-lg">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 font-mono">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="client@krono.luxury"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/70 mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d48] text-black font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/25 disabled:opacity-50"
              >
                {authLoading ? "Authenticating Client..." : "Sign In & Complete Order →"}
              </button>
            </form>

            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-white/50">
              <Link
                href="/register?returnUrl=/checkout"
                className="hover:text-[#C5A059] underline"
              >
                Create New Account
              </Link>
              <Link
                href="/login?returnUrl=/checkout"
                className="hover:text-white"
              >
                Full Sign In Page →
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#C5A059] font-mono text-xs">
          Loading Protected Checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
