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

const SRI_LANKA_PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "North Western",
  "Sabaragamuwa",
  "Eastern",
  "Uva",
  "Northern",
  "North Central",
];

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
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [activeStep, setActiveStep] = useState<"details" | "payment">("details");
  const [paymentMethod, setPaymentMethod] = useState<"payhere" | "wire" | "cod">("payhere");
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState("payhere");
  const [errorMsg, setErrorMsg] = useState("");
  const [cancelMsg, setCancelMsg] = useState("");
  const [cancelDismissed, setCancelDismissed] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Delivery form state matching the exact fields in sample image
  const [deliveryData, setDeliveryData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "Colombo",
    province: "Western",
  });

  // Pre-fill user data upon auth load
  useEffect(() => {
    if (user) {
      const parts = (user.name || "").trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      setDeliveryData((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        streetAddress: prev.streetAddress || user.address || "",
      }));
    }
  }, [user]);

  // Lock background scroll when info modal is open
  useEffect(() => {
    if (!infoModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [infoModalOpen]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDeliveryData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryData.firstName.trim()) {
      setErrorMsg("Please enter your first name.");
      return;
    }
    if (!deliveryData.email.trim() || !deliveryData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!deliveryData.phone.trim()) {
      setErrorMsg("Please enter your mobile phone number.");
      return;
    }
    if (!deliveryData.streetAddress.trim()) {
      setErrorMsg("Please enter your house number and street.");
      return;
    }
    if (!deliveryData.city.trim()) {
      setErrorMsg("Please enter your city.");
      return;
    }

    setActiveStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const fullName = `${deliveryData.firstName} ${deliveryData.lastName}`.trim() || "Customer";
      const fullAddress = `${deliveryData.streetAddress}, ${deliveryData.city}, ${deliveryData.province}`;

      const orderPayload = {
        name: fullName,
        email: deliveryData.email,
        phone: deliveryData.phone,
        address: fullAddress,
        city: deliveryData.city,
        postal_code: "00100",
        country: "Sri Lanka",
        payment_method: paymentMethod,
        items: cart.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image_url: i.product.image_url,
        })),
        total_amount: grandTotal,
        subtotal_amount: subtotal,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon || null,
      };

      const result = await createOrder(orderPayload);
      const generatedOrderId = result.order?.id || result.order_id || `ORD-${Date.now()}`;
      setOrderId(generatedOrderId);
      setConfirmedPaymentMethod(paymentMethod);

      if (paymentMethod === "payhere") {
        // Continue with PayHere form submission
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
    return `Rs. ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatInstallment = (amount: number) => {
    return `Rs. ${(Number(amount || 0) / 3).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading || !isCartReady) {
    return (
      <div className="min-h-screen flex flex-col bg-[#EEF2F6] text-neutral-900 font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-xs font-mono text-neutral-600 animate-pulse">
            Loading checkout...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const itemsSummaryString = cart
    .map((item) => `${item.product.name} (x${item.quantity})`)
    .join(", ");

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2F6] text-neutral-900 selection:bg-black selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Title matching sample image */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 mb-8 font-sans">
          Checkout
        </h1>

        {/* Cancellation Message */}
        {(cancelMsg || (paymentWasCancelled && !cancelDismissed)) && !orderConfirmed && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start justify-between gap-3 text-xs text-amber-900 font-sans">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-base">⚠️</span>
              <span>
                {cancelMsg ||
                  "Payment was cancelled. Your items remain in your cart and you can retry anytime."}
              </span>
            </div>
            <button
              onClick={() => {
                setCancelMsg("");
                setCancelDismissed(true);
              }}
              className="text-amber-700 hover:text-amber-950 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Order Confirmed Screen */}
        {orderConfirmed ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm border border-neutral-200/80">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-2xl">
              ✓
            </div>

            <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase bg-emerald-50 text-emerald-700 inline-block mb-3">
              Order Confirmed
            </span>

            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Thank you for your order!
            </h2>
            <p className="text-xs text-neutral-600 mb-6">
              Order Reference: <strong className="text-neutral-950">{orderId}</strong>
            </p>

            <div className="p-4 bg-neutral-50 rounded-xl max-w-md mx-auto mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Payment Method:</span>
                <span className="font-semibold text-neutral-900 uppercase">
                  {confirmedPaymentMethod === "payhere" ? "PayHere Gateway" : confirmedPaymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Recipient:</span>
                <span className="font-semibold text-neutral-900">
                  {deliveryData.firstName} {deliveryData.lastName}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping Address:</span>
                <span className="font-semibold text-neutral-900 text-right">
                  {deliveryData.city}, {deliveryData.province}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Link
                href="/catalog"
                className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/profile"
                className="px-6 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-lg transition-colors"
              >
                View Orders
              </Link>
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart Screen */
          <div className="bg-white rounded-2xl p-10 text-center max-w-lg mx-auto shadow-sm border border-neutral-200">
            <div className="text-4xl mb-3">🛒</div>
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Your cart is empty</h2>
            <p className="text-xs text-neutral-500 mb-6">
              Add some items to your cart before proceeding to checkout.
            </p>
            <Link
              href="/catalog"
              className="px-6 py-2.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Two-Column Grid matching the sample layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ========================================================
                LEFT COLUMN:
                Cart Item Cards matching sample image
               ======================================================== */}
            <div className="lg:col-span-7 space-y-4">
              {cart.map((item) => {
                const itemImg = getProductImage(item.product.id, item.product.image_url);
                return (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative transition-all"
                  >
                    {/* Left: Product Thumbnail & Title / Price Details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-100 p-2">
                        <SmoothImage
                          src={itemImg}
                          alt={item.product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Title & Installment Pricing */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-neutral-900 leading-snug line-clamp-2">
                          {item.product.name}
                        </h3>

                        <div className="text-sm sm:text-base font-bold text-neutral-950">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>

                        {/* Installment Badges matching sample image (Koko & Mintpay) */}
                        <div className="space-y-1 pt-0.5 text-[11px] text-neutral-600 font-sans">
                          {/* Koko Row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{formatInstallment(item.product.price * item.quantity)} × 3</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8] uppercase tracking-wider">
                              koko
                            </span>
                          </div>

                          {/* Mintpay Row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{formatInstallment(item.product.price * item.quantity)} × 3</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] lowercase tracking-wider">
                              mintpay
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: In Stock Badge (Top) and Quantity Stepper (Bottom) */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between w-full sm:w-auto self-stretch pt-2 sm:pt-0">
                      {/* In Stock Badge */}
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                        In Stock
                      </span>

                      {/* Stepper Control (Trash/Minus on Left, Number, Plus on Right) */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeFromCart(item.product.id);
                            } else {
                              updateQuantity(item.product.id, -1);
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-[#ECEEF2] hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                          title="Decrease or remove"
                        >
                          ✕
                        </button>

                        <span className="w-6 text-center text-xs font-bold text-neutral-900">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-8 h-8 rounded-lg bg-[#ECEEF2] hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Order Subtotal Notice */}
              <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 flex items-center justify-between text-xs font-sans">
                <span className="text-neutral-600 font-medium">Order Subtotal:</span>
                <span className="text-sm font-bold text-neutral-950">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* ========================================================
                RIGHT COLUMN:
                Top Stepper Indicator & Delivery Details Form
               ======================================================== */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Stepper Progress matching sample image */}
              <div className="flex items-center gap-6 text-xs font-sans px-1">
                {/* Step 1: Review */}
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="text-neutral-900 font-semibold">Review</span>
                </div>

                {/* Step 2: Details */}
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      activeStep === "details"
                        ? "border-2 border-black text-black font-extrabold"
                        : "bg-black text-white"
                    }`}
                  >
                    {activeStep === "payment" ? "✓" : "2"}
                  </span>
                  <span
                    className={`font-semibold ${
                      activeStep === "details" ? "text-neutral-900" : "text-neutral-500"
                    }`}
                  >
                    Details
                  </span>
                </div>

                {/* Step 3: Payment */}
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      activeStep === "payment"
                        ? "border-2 border-black text-black font-extrabold"
                        : "border border-neutral-400 text-neutral-400"
                    }`}
                  >
                    3
                  </span>
                  <span
                    className={`font-semibold ${
                      activeStep === "payment" ? "text-neutral-900" : "text-neutral-400"
                    }`}
                  >
                    Payment
                  </span>
                </div>
              </div>

              {/* Form Card or Payment Step */}
              {activeStep === "details" ? (
                /* Step 2: Delivery Details Form matching sample image */
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-200/80">
                  <h2 className="text-base font-bold text-neutral-950 mb-5 font-sans">
                    Delivery details
                  </h2>

                  {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-sans">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleContinueToPayment} className="space-y-4">
                    {/* First name & Last name (2 columns) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-normal text-neutral-700 mb-1.5 font-sans">
                          First name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={deliveryData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-[#EEF0F4] border border-transparent focus:border-neutral-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-normal text-neutral-700 mb-1.5 font-sans">
                          Last name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={deliveryData.lastName}
                          onChange={handleInputChange}
                          className="w-full bg-[#EEF0F4] border border-transparent focus:border-neutral-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-normal text-neutral-700 mb-1.5 font-sans">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={deliveryData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-[#EEF0F4] border border-transparent focus:border-neutral-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition-all"
                      />
                    </div>

                    {/* Mobile number */}
                    <div>
                      <label className="block text-xs font-normal text-neutral-700 mb-1.5 font-sans">
                        Mobile number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={deliveryData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="07X XXX XXXX"
                        className="w-full bg-[#EEF0F4] border border-transparent focus:border-neutral-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all"
                      />
                    </div>

                    {/* House number and street */}
                    <div>
                      <label className="block text-xs font-normal text-neutral-700 mb-1.5 font-sans">
                        House number and street
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={deliveryData.streetAddress}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-[#EEF0F4] border border-transparent focus:border-neutral-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition-all"
                      />
                    </div>

                    {/* City & Province (2 columns) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-normal text-neutral-700 mb-1.5 font-sans">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={deliveryData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-[#EEF0F4] border border-transparent focus:border-neutral-400 focus:bg-white rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-normal text-neutral-700 mb-1.5 font-sans">
                          Province
                        </label>
                        <select
                          name="province"
                          value={deliveryData.province}
                          onChange={handleInputChange}
                          className="w-full bg-[#EEF0F4] border border-transparent focus:border-neutral-400 focus:bg-white rounded-lg px-3 py-2.5 text-xs text-neutral-900 outline-none transition-all appearance-none cursor-pointer"
                        >
                          {SRI_LANKA_PROVINCES.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Bottom Action Row (Info button on Left, Continue on Right) */}
                    <div className="pt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setInfoModalOpen(true)}
                        className="w-10 h-10 rounded-lg bg-[#EEF0F4] hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer text-sm"
                        title="Delivery information"
                      >
                        ⓘ
                      </button>

                      <button
                        type="submit"
                        className="flex-1 bg-black hover:bg-neutral-800 text-white font-semibold text-xs px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                      >
                        <span>Continue to payment</span>
                        <span className="text-sm leading-none">›</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Step 3: Payment Step */
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-neutral-200/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h2 className="text-base font-bold text-neutral-950 font-sans">
                      Select Payment Method
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveStep("details")}
                      className="text-xs text-neutral-500 hover:text-black underline font-sans"
                    >
                      ← Back to Details
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                      {errorMsg}
                    </div>
                  )}

                  {/* Payment Choices */}
                  <div className="space-y-3 font-sans">
                    {/* PayHere Online Gateway */}
                    <label
                      onClick={() => setPaymentMethod("payhere")}
                      className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                        paymentMethod === "payhere"
                          ? "border-black bg-neutral-50 shadow-xs"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === "payhere"}
                        onChange={() => setPaymentMethod("payhere")}
                        className="mt-0.5 accent-black"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-neutral-950">
                            PayHere Payment Gateway
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">
                            Instant
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Pay securely with Visa, MasterCard, Genie, Koko, or eZ Cash.
                        </p>
                      </div>
                    </label>

                    {/* Bank Wire */}
                    <label
                      onClick={() => setPaymentMethod("wire")}
                      className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                        paymentMethod === "wire"
                          ? "border-black bg-neutral-50 shadow-xs"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === "wire"}
                        onChange={() => setPaymentMethod("wire")}
                        className="mt-0.5 accent-black"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-xs text-neutral-950">
                          Direct Bank Transfer (Online Banking)
                        </span>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Receive our bank details for online transfer or bank deposit.
                        </p>
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-black bg-neutral-50 shadow-xs"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-0.5 accent-black"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-xs text-neutral-950">
                          Cash on Delivery
                        </span>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Pay in cash when your order is delivered to your doorstep.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Summary & Place Order */}
                  <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs font-sans">
                    <div className="flex justify-between text-neutral-600">
                      <span>Total Amount:</span>
                      <span className="font-bold text-neutral-950 text-sm">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>

                    {paymentMethod === "payhere" && orderId ? (
                      <PayHereForm
                        orderId={orderId}
                        amount={grandTotal}
                        currency="LKR"
                        itemsDescription={itemsSummaryString}
                        customer={{
                          fullName: `${deliveryData.firstName} ${deliveryData.lastName}`.trim(),
                          email: deliveryData.email,
                          phone: deliveryData.phone,
                          address: deliveryData.streetAddress,
                          city: deliveryData.city,
                          country: "Sri Lanka",
                        }}
                        isSubmitting={submitting}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={submitting}
                        className="w-full mt-2 bg-black hover:bg-neutral-800 text-white font-semibold text-xs py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {submitting
                          ? "Processing Order..."
                          : paymentMethod === "payhere"
                          ? `Continue to PayHere (${formatPrice(grandTotal)})`
                          : `Confirm Order (${formatPrice(grandTotal)})`}
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}
      </main>

      {/* Info Modal */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 font-sans text-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm">Delivery Information</h3>
              <button
                onClick={() => setInfoModalOpen(false)}
                className="text-neutral-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-neutral-600 space-y-2.5 leading-relaxed">
              <p>
                ✦ <strong>Islandwide Delivery:</strong> Orders within the Western province are delivered within 24 to 48 hours. Other provinces take 2 to 3 business days.
              </p>
              <p>
                ✦ <strong>Courier Contact:</strong> Our driver will call your mobile number before arrival.
              </p>
              <p>
                ✦ <strong>Insured Transit:</strong> All packages are sealed and fully insured during transit.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
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
        <div className="min-h-screen bg-[#EEF2F6] flex items-center justify-center font-mono text-xs text-neutral-600">
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
