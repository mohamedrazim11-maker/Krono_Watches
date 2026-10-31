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
import { launchPayHerePayment } from "@/lib/payhere";

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
    couponType,
    couponValue,
    specialOffers,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [checkoutCoupon, setCheckoutCoupon] = useState("");
  const [checkoutCouponError, setCheckoutCouponError] = useState("");
  const [showCheckoutOffers, setShowCheckoutOffers] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"payhere" | "bank" | "cod">("payhere");
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState("payhere");
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
    city: "",
    district: "",
    postalCode: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      try {
        const stored = localStorage.getItem(`krono_saved_addresses_${user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
          }
        }
      } catch {}
    }
  }, [user]);

  const handleSelectSavedAddress = (addr: any) => {
    const parts = (addr.recipientName || "").trim().split(" ");
    const fName = parts[0] || "";
    const lName = parts.slice(1).join(" ") || "";

    setFormData((prev) => ({
      ...prev,
      firstName: fName || prev.firstName,
      lastName: lName || prev.lastName,
      phone: addr.phone || prev.phone,
      address: addr.streetAddress || prev.address,
      city: addr.city || prev.city,
      postalCode: addr.postalCode || prev.postalCode,
    }));
  };

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
          setConfirmedPaymentMethod("payhere");
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

  // Smooth scroll to payment section if redirected from "Proceed to Payment"
  useEffect(() => {
    const step = searchParams.get("step") || searchParams.get("focus");
    if (step === "payment") {
      const timer = setTimeout(() => {
        const el = document.getElementById("payment-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const shippingCost = deliveryMethod === "express" ? 650 : 0;
  const finalTotal = grandTotal + shippingCost;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Enforce login requirement before order creation
    if (!isAuthenticated) {
      setErrorMsg("You must be signed in to place an order. Redirecting to login...");
      router.push("/login?redirect=/checkout");
      return;
    }

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
        payment_method: paymentMethod === "payhere" ? "payhere" : paymentMethod === "bank" ? "wire" : "cod",
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

      if (paymentMethod === "payhere") {
        // Fetch server hash dynamically from /api/orders/payhere-hash
        const hashRes = await fetch("/api/orders/payhere-hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: generatedOrderId }),
        });
        const hashData = await hashRes.json();
        if (!hashRes.ok || !hashData.success || !hashData.data) {
          throw new Error(hashData.message || "Failed to generate PayHere security hash.");
        }

        const origin = window.location.origin.replace(/\/+$/, "");
        const itemsDescription = cart.map((i) => `${i.product.name} (x${i.quantity})`).join(", ") || "Krono Timepiece Order";

        // Launch the ORIGINAL PayHere UI modal immediately
        await launchPayHerePayment(
          {
            sandbox: true,
            merchant_id: hashData.data.merchant_id,
            return_url: `${origin}/checkout?payment=success&order_id=${encodeURIComponent(generatedOrderId)}`,
            cancel_url: `${origin}/checkout?payment=cancelled&order_id=${encodeURIComponent(generatedOrderId)}`,
            notify_url: `${origin}/api/orders/payhere-notify`,
            order_id: generatedOrderId,
            items: itemsDescription,
            amount: finalTotal,
            currency: "LKR",
            hash: hashData.data.hash,
            first_name: formData.firstName.trim() || "Customer",
            last_name: formData.lastName.trim() || "Client",
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            country: "Sri Lanka",
            delivery_address: fullAddress,
            delivery_city: formData.city.trim(),
            delivery_country: "Sri Lanka",
          },
          {
            onCompleted: () => {
              setOrderConfirmed(true);
              clearCart();
            },
            onDismissed: () => {
              setErrorMsg("PayHere payment modal was closed. You can click 'Pay with PayHere' below to re-open.");
            },
            onError: (error) => {
              setErrorMsg(`PayHere Error: ${error}`);
            },
          }
        );
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

  // Strict Authentication Gate: User MUST be signed in to place order
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07080A] text-white selection:bg-[#C5A059] selection:text-black font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-16 flex items-center justify-center">
          <div className="w-full max-w-lg bg-[#0E1015] border border-[#C5A059]/40 rounded-2xl p-8 sm:p-10 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#14161C] border border-[#C5A059] flex items-center justify-center text-[#C5A059] text-3xl shadow-lg shadow-[#C5A059]/10">
              🔒
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#C5A059] uppercase tracking-widest font-bold block">
                Account Sign In Required
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Authentication Required
              </h1>
              <p className="text-xs sm:text-sm text-[#8E95A5] max-w-sm mx-auto leading-relaxed">
                You must be logged in to place an order and proceed to PayHere sandbox payment gateway.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login?redirect=/checkout"
                className="block w-full py-4 bg-[#C5A059] hover:bg-[#d4af37] text-black font-bold text-xs uppercase tracking-[0.18em] rounded-xl transition-all shadow-lg hover:shadow-[#C5A059]/20"
              >
                Sign In to Place Order
              </Link>
              <Link
                href="/register?redirect=/checkout"
                className="block w-full py-3.5 border border-[#282E38] hover:border-[#C5A059] text-white hover:text-[#C5A059] font-mono text-xs uppercase tracking-wider rounded-xl transition-colors bg-[#14161C]"
              >
                Create New Account
              </Link>
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-[#1E232B] flex items-center justify-between text-xs font-mono text-[#8E95A5]">
                <span>{cart.reduce((s, i) => s + i.quantity, 0)} Items waiting in cart</span>
                <span className="text-[#C5A059] font-bold">{formatPrice(finalTotal)}</span>
              </div>
            )}
          </div>
        </main>
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

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href={`/orders/track?orderId=${encodeURIComponent(orderId)}`}
                className="px-6 py-3 bg-[#C5A059] hover:bg-[#D4AF37] text-black text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20"
              >
                <span>📦 Track Shipment Now →</span>
              </Link>
              <Link
                href="/profile"
                className="px-6 py-3 bg-[#1C2028] hover:bg-[#282E38] text-white text-xs font-mono uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center"
              >
                View Order in Account
              </Link>
              <Link
                href="/catalog"
                className="px-5 py-3 border border-[#282E38] hover:border-white/40 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                    SHIPPING ADDRESS
                  </h2>
                  {savedAddresses.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-[#8E95A5]">Use Saved:</span>
                      {savedAddresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(a)}
                          className="px-2 py-0.5 rounded bg-[#14161C] border border-[#2E3440] hover:border-[#C5A059] text-white hover:text-[#C5A059] transition-colors cursor-pointer"
                          title={`${a.recipientName} - ${a.streetAddress}`}
                        >
                          {a.isDefault ? "★ " : ""}{a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
              <div id="payment-section" className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-4 shadow-md scroll-mt-24">
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                  PAYMENT
                </h2>
                <div className="space-y-3">
                  {/* Pay with PayHere */}
                  <label
                    onClick={() => setPaymentMethod("payhere")}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "payhere"
                        ? "bg-[#14161C] border-[#C5A059]"
                        : "bg-[#101217] border-[#262A33] hover:border-[#383E4B]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${paymentMethod === "payhere" ? "border-[#C5A059] text-[#C5A059]" : "border-[#5E6573]"}`}>
                        {paymentMethod === "payhere" && "●"}
                      </span>
                      <span className="text-xs font-mono text-white">Pay with PayHere</span>
                    </div>
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

                {/* Promo Code & Special Offers */}
                <div className="pt-2 border-t border-[#1E232B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#8E95A5] uppercase tracking-wider">
                      Promotional Voucher
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCheckoutOffers((prev) => !prev)}
                      className="text-[11px] font-mono text-[#C5A059] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Special Offers ({specialOffers.length})</span>
                      <span>{showCheckoutOffers ? "▲" : "▼"}</span>
                    </button>
                  </div>

                  <div className="flex rounded-lg border border-[#262A33] overflow-hidden focus-within:border-[#C5A059] bg-[#14161C]">
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. ROYAL20)"
                      value={checkoutCoupon}
                      onChange={(e) => setCheckoutCoupon(e.target.value.toUpperCase())}
                      className="flex-1 bg-transparent px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none placeholder:text-[#5E6573]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutCouponError("");
                        if (!checkoutCoupon.trim()) return;
                        const ok = applyCoupon(checkoutCoupon.trim());
                        if (!ok) {
                          setCheckoutCouponError("Invalid code. Try ROYAL20 or check special offers.");
                        } else {
                          setCheckoutCoupon("");
                        }
                      }}
                      className="px-3.5 py-2 bg-[#1C2028] hover:bg-[#282E38] text-[#C5A059] text-xs font-mono font-bold uppercase tracking-wider border-l border-[#262A33] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {checkoutCouponError && (
                    <p className="text-[10px] text-red-400 font-mono">{checkoutCouponError}</p>
                  )}

                  {appliedCoupon && (
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-[11px] font-mono text-emerald-300">
                      <span>✓ {appliedCoupon} ({couponType === "fixed" ? `Fixed LKR ${couponValue.toLocaleString()} OFF` : `${couponValue}% OFF`})</span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-red-400 hover:text-red-300 uppercase text-[9px] font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {showCheckoutOffers && (
                    <div className="p-2.5 bg-[#12141A] border border-[#262A33] rounded-lg space-y-1.5 max-h-48 overflow-y-auto">
                      {specialOffers.map((offer) => {
                        const isApplied = appliedCoupon === offer.code;
                        return (
                          <div
                            key={offer.code}
                            className={`p-2 rounded border text-[11px] font-mono flex items-center justify-between gap-2 ${
                              isApplied ? "bg-emerald-950/30 border-emerald-500/50" : "bg-[#14161C] border-[#222730]"
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-white uppercase">{offer.code}</span>
                              <div className="text-[10px] text-[#8E95A5] truncate">{offer.description}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => (isApplied ? removeCoupon() : applyCoupon(offer.code))}
                              className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                                isApplied ? "bg-emerald-500 text-black" : "bg-[#C5A059] text-black"
                              }`}
                            >
                              {isApplied ? "Applied" : "Apply"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Subtotal, Shipping, Total */}
                <div className="space-y-3 pt-3 border-t border-[#1E232B] text-xs font-mono">
                  <div className="flex justify-between text-[#8E95A5]">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>
                        Discount ({appliedCoupon} · {couponType === "fixed" ? `Fixed LKR ${couponValue.toLocaleString()}` : `${couponValue}%`})
                      </span>
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
                  {orderId && paymentMethod === "payhere" ? (
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
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || cart.length === 0}
                      className="w-full py-4 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.18em] transition-all rounded-lg shadow-lg hover:shadow-[#C5A059]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting
                        ? "PROCESSING ORDER..."
                        : paymentMethod === "payhere"
                        ? "PAY WITH PAYHERE"
                        : "PLACE ORDER"}
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
