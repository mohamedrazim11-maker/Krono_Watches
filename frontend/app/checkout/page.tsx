"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { createOrder, fetchOrderById } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import PayHereForm from "@/components/PayHereForm";
import { getProductImage } from "@/lib/productImages";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentWasCancelled = searchParams.get("payment") === "cancelled";
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    cart,
    isCartReady,
    grandTotal,
    subtotal,
    discountAmount,
    appliedCoupon,
    clearCart,
  } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "cod">("card");
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState("card");
  const [errorMsg, setErrorMsg] = useState("");
  const [cancelMsg, setCancelMsg] = useState("");
  const [cancelDismissed, setCancelDismissed] = useState(false);

  // Form state matching Page 2 Wireframe
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "Colombo",
    district: "Western",
    postalCode: "00100",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  // Pre-fill user data upon auth load
  useEffect(() => {
    if (user) {
      const parts = (user.name || "").trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
      }));
    }
  }, [user]);

  // Payment confirmation verification from PayHere redirect
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
          setConfirmedPaymentMethod("card");
          if (order.payment_status === "paid") {
            setOrderConfirmed(true);
            clearCart();
            return;
          }

          if (
            order.payment_status === "cancelled" ||
            order.payment_status === "failed" ||
            attempt >= 14
          ) {
            setCancelMsg(
              order.payment_status === "cancelled" || order.payment_status === "failed"
                ? "Payment was cancelled or unverified. Your items remain in your cart."
                : "Payment confirmation is pending. Please refresh this page."
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
              : "Unable to verify your payment status."
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const shippingCost = deliveryMethod === "express" ? 2500 : 0;
  const finalTotal = grandTotal + shippingCost;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (cart.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Please enter your phone number.");
      return;
    }
    if (!formData.firstName.trim()) {
      setErrorMsg("Please enter your first name.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg("Please enter your delivery street address.");
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg("Please enter your city.");
      return;
    }
    if (!termsAgreed) {
      setErrorMsg("Please agree to the terms and return policy to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim() || "Customer";
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.district} ${formData.postalCode}`;

      const orderPayload = {
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        city: formData.city,
        postal_code: formData.postalCode,
        country: "Sri Lanka",
        payment_method: paymentMethod === "card" ? "payhere" : paymentMethod === "bank" ? "wire" : "cod",
        items: cart.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image_url: i.product.image_url,
        })),
        total_amount: finalTotal,
        subtotal_amount: subtotal,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon || null,
      };

      const result = await createOrder(orderPayload);
      const generatedOrderId = result.order?.id || result.order_id || `ORD-${Date.now()}`;
      setOrderId(generatedOrderId);
      setConfirmedPaymentMethod(paymentMethod);

      if (paymentMethod === "card") {
        // Continue to PayHere trigger
        return;
      }

      setOrderConfirmed(true);
      clearCart();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to place order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  if (isLoading || !isCartReady) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07080A] text-white font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-xs font-mono text-[#8E95A5] animate-pulse">
            Loading checkout...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07080A] text-white selection:bg-[#C5A059] selection:text-black font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title & Stepper Breadcrumbs matching Page 2 Wireframe */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
            Checkout
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E95A5] mt-2">
            <span className="text-[#C5A059] font-bold">1 Shipping</span>
            <span>—</span>
            <span className="text-white">2 Payment</span>
            <span>—</span>
            <span>3 Review</span>
          </div>
        </div>

        {/* Cancellation Message */}
        {(cancelMsg || (paymentWasCancelled && !cancelDismissed)) && !orderConfirmed && (
          <div className="mb-6 p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start justify-between gap-3 text-xs text-amber-300 font-mono">
            <span>
              {cancelMsg || "Payment was cancelled. Your items remain in your cart and you can retry anytime."}
            </span>
            <button
              onClick={() => {
                setCancelMsg("");
                setCancelDismissed(true);
              }}
              className="text-amber-400 hover:text-amber-200 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 font-mono">
            {errorMsg}
          </div>
        )}

        {/* Confirmed Order State */}
        {orderConfirmed ? (
          <div className="max-w-2xl mx-auto bg-[#0E1015] border border-[#282E38] rounded-xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-2xl text-emerald-400">
              ✓
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold block">
                Order Confirmed
              </span>
              <h2 className="text-2xl font-serif font-bold text-white uppercase">
                Thank You For Your Order
              </h2>
              <p className="text-xs font-mono text-[#8E95A5]">
                Order Reference: <span className="text-white font-bold">{orderId}</span>
              </p>
            </div>

            <p className="text-xs text-[#8E95A5] font-mono leading-relaxed max-w-md mx-auto">
              A certified confirmation email with full horological credentials and tracking details has been sent to{" "}
              <span className="text-white">{formData.email}</span>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/profile"
                className="px-6 py-3 bg-[#1C2028] hover:bg-[#282E38] text-white text-xs font-mono uppercase tracking-wider rounded-lg transition-colors"
              >
                View Order in Account
              </Link>
              <Link
                href="/catalog"
                className="px-6 py-3 bg-[#C5A059] hover:bg-[#D4AF37] text-black text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* 2-Column Checkout Layout matching Page 2 Wireframe */
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Boxes */}
            <div className="lg:col-span-7 space-y-6">
              {/* Box 1: CONTACT */}
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-4 shadow-md">
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                  CONTACT
                </h2>
                <div className="space-y-3">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-[#5E6573]"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-[#5E6573]"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: SHIPPING ADDRESS */}
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-4 shadow-md">
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                  SHIPPING ADDRESS
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-[#5E6573]"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-[#5E6573]"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-[#5E6573]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-[#5E6573]"
                    />
                    <input
                      type="text"
                      name="district"
                      placeholder="District"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-[#5E6573]"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Postal code"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-[#5E6573]"
                    />
                  </div>
                </div>
              </div>

              {/* Box 3: DELIVERY */}
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-4 shadow-md">
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                  DELIVERY
                </h2>
                <div className="space-y-3">
                  <label
                    onClick={() => setDeliveryMethod("standard")}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      deliveryMethod === "standard"
                        ? "bg-[#14161C] border-[#C5A059]"
                        : "bg-[#101217] border-[#262A33] hover:border-[#383E4B]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${deliveryMethod === "standard" ? "border-[#C5A059] text-[#C5A059]" : "border-[#5E6573]"}`}>
                        {deliveryMethod === "standard" && "●"}
                      </span>
                      <span className="text-xs font-mono text-white">Standard · 3–5 days</span>
                    </div>
                    <span className="text-xs font-mono text-[#8E95A5]">LKR — Free</span>
                  </label>

                  <label
                    onClick={() => setDeliveryMethod("express")}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      deliveryMethod === "express"
                        ? "bg-[#14161C] border-[#C5A059]"
                        : "bg-[#101217] border-[#262A33] hover:border-[#383E4B]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${deliveryMethod === "express" ? "border-[#C5A059] text-[#C5A059]" : "border-[#5E6573]"}`}>
                        {deliveryMethod === "express" && "●"}
                      </span>
                      <span className="text-xs font-mono text-white">Express · 1–2 days</span>
                    </div>
                    <span className="text-xs font-mono text-[#C5A059]">LKR 2,500</span>
                  </label>
                </div>
              </div>

              {/* Box 4: PAYMENT */}
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-4 shadow-md">
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                  PAYMENT
                </h2>
                <div className="space-y-3">
                  {/* Card Option */}
                  <label
                    onClick={() => setPaymentMethod("card")}
                    className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "bg-[#14161C] border-[#C5A059]"
                        : "bg-[#101217] border-[#262A33] hover:border-[#383E4B]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${paymentMethod === "card" ? "border-[#C5A059] text-[#C5A059]" : "border-[#5E6573]"}`}>
                          {paymentMethod === "card" && "●"}
                        </span>
                        <span className="text-xs font-mono text-white font-medium">Credit / debit card</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#8E95A5]">Visa, Mastercard, PayHere</span>
                    </div>

                    {paymentMethod === "card" && (
                      <div className="mt-4 pt-4 border-t border-[#262A33] space-y-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          name="cardNumber"
                          placeholder="Card number"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="w-full bg-[#0E1015] border border-[#262A33] rounded-lg px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] placeholder:text-[#5E6573]"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="cardExpiry"
                            placeholder="MM / YY"
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            className="w-full bg-[#0E1015] border border-[#262A33] rounded-lg px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] placeholder:text-[#5E6573]"
                          />
                          <input
                            type="text"
                            name="cardCvv"
                            placeholder="CVV"
                            value={formData.cardCvv}
                            onChange={handleInputChange}
                            className="w-full bg-[#0E1015] border border-[#262A33] rounded-lg px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] placeholder:text-[#5E6573]"
                          />
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Bank Transfer */}
                  <label
                    onClick={() => setPaymentMethod("bank")}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "bank"
                        ? "bg-[#14161C] border-[#C5A059]"
                        : "bg-[#101217] border-[#262A33] hover:border-[#383E4B]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${paymentMethod === "bank" ? "border-[#C5A059] text-[#C5A059]" : "border-[#5E6573]"}`}>
                        {paymentMethod === "bank" && "●"}
                      </span>
                      <span className="text-xs font-mono text-white">Bank transfer</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#8E95A5]">Direct Wire</span>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "bg-[#14161C] border-[#C5A059]"
                        : "bg-[#101217] border-[#262A33] hover:border-[#383E4B]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${paymentMethod === "cod" ? "border-[#C5A059] text-[#C5A059]" : "border-[#5E6573]"}`}>
                        {paymentMethod === "cod" && "●"}
                      </span>
                      <span className="text-xs font-mono text-white">Cash on delivery</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#8E95A5]">Courier COD</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: YOUR ORDER Box matching Page 2 Wireframe */}
            <div className="lg:col-span-5">
              <div className="bg-[#0E1015] border border-[#282E38] rounded-xl p-6 sm:p-7 space-y-6 shadow-xl sticky top-24">
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em] border-b border-[#1E232B] pb-3">
                  YOUR ORDER
                </h2>

                {/* Ordered Items List */}
                <div className="divide-y divide-[#1A1D24] max-h-80 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const resolvedImg = getProductImage(item.product.id, item.product.image_url);
                    const lineTotal = item.product.price * item.quantity;

                    return (
                      <div key={item.product.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 bg-[#14161C] border border-[#262A33] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                            <SmoothImage
                              src={resolvedImg}
                              alt={item.product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate max-w-[170px]">
                              {item.product.name}
                            </div>
                            <div className="text-[11px] font-mono text-[#8E95A5]">
                              Qty {item.quantity}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-mono font-bold text-white text-right">
                          {formatPrice(lineTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal, Shipping, Total */}
                <div className="space-y-3 pt-3 border-t border-[#1E232B] text-xs font-mono">
                  <div className="flex justify-between text-[#8E95A5]">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({appliedCoupon})</span>
                      <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#8E95A5]">
                    <span>Shipping</span>
                    <span className="text-white">
                      {shippingCost === 0 ? "LKR — Free" : formatPrice(shippingCost)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#1E232B] flex justify-between items-baseline text-sm font-bold text-white">
                    <span>Total</span>
                    <span className="text-base text-[#C5A059] font-mono">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Action Button & Terms Checkbox matching Wireframe 2 */}
                <div className="space-y-4 pt-2">
                  {orderId && paymentMethod === "card" ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 font-mono text-center">
                        Order registered: {orderId}. Click below to proceed to PayHere gateway.
                      </div>
                      <PayHereForm
                        orderId={orderId}
                        amount={finalTotal}
                        itemsDescription={cart.map((i) => `${i.product.name} (x${i.quantity})`).join(", ")}
                        customer={{
                          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                          email: formData.email,
                          phone: formData.phone,
                          address: formData.address,
                          city: formData.city,
                          country: "Sri Lanka",
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || cart.length === 0}
                      className="w-full py-4 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.18em] transition-all rounded-lg shadow-lg hover:shadow-[#C5A059]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting ? "PROCESSING ORDER..." : "PLACE ORDER"}
                    </button>
                  )}

                  {/* Terms agreement checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-[11px] font-mono text-[#8E95A5] select-none">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#262A33] bg-[#14161C] text-[#C5A059] accent-[#C5A059]"
                    />
                    <span>I agree to the terms and return policy</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080A] flex items-center justify-center text-xs font-mono text-[#C5A059]">
          Loading Krono Checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
