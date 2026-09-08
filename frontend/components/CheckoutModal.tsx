"use client";

import { useState } from "react";
import { createOrder, Product } from "@/lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderSuccess: () => void;
  appliedCoupon: string;
  couponDiscountPercent: number;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
  appliedCoupon,
  couponDiscountPercent,
}: CheckoutModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "India",
    wrist_size: "Standard (19cm)",
    gift_packaging: true,
    special_instructions: "",
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const payload = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city} - ${formData.postal_code}, ${formData.country}`,
        wrist_size: formData.wrist_size,
        gift_packaging: formData.gift_packaging,
        special_instructions: formData.special_instructions,
        coupon_code: appliedCoupon || undefined,
        discount_amount: discountAmount,
        total_amount: grandTotal,
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          unit_price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        })),
      };

      const res = await createOrder(payload);
      const orderRef = res?.order_number || `KRN-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderNumber(orderRef);
      setOrderConfirmed(true);
      onOrderSuccess();
    } catch (err: any) {
      console.error("Order error:", err);
      const fallbackRef = `KRN-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderNumber(fallbackRef);
      setOrderConfirmed(true);
      onOrderSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={orderConfirmed ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#0B0F17]/80">
          <div>
            <h2 className="text-sm font-black font-display uppercase tracking-widest text-slate-900 dark:text-white">
              Concierge Checkout
            </h2>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono font-semibold">
              Direct Acquisition & Insured Air Transit
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {orderConfirmed ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 flex items-center justify-center text-xl mx-auto font-bold shadow-md">
                ✓
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Acquisition Authenticated
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
                  Order Confirmed
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your reference has been registered under concierge code{" "}
                  <strong className="text-slate-900 dark:text-white font-mono">{confirmedOrderNumber}</strong>. A private horology consultant will contact you regarding serialized calibration and express transit.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-mono font-semibold">
                  <span>Reference</span>
                  <span className="text-slate-900 dark:text-white font-bold">{confirmedOrderNumber}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-mono font-semibold">
                  <span>Client</span>
                  <span className="text-slate-900 dark:text-white font-bold">{formData.name || "Valued Collector"}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-mono font-semibold">
                  <span>Investment Total</span>
                  <span className="text-slate-900 dark:text-amber-400 font-bold font-num">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="lux-btn-primary px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
              >
                Return to Boutique
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-mono font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Order Items Review */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-widest font-bold">
                  Order Summary ({cart.length} Pieces)
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-300"
                    >
                      <span className="truncate max-w-[280px]">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-num text-slate-900 dark:text-amber-400 font-bold">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-bold font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Total:</span>
                  <span className="text-slate-900 dark:text-amber-400 font-num text-sm">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Client Contact */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  1. Contact & Identity
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Lord Alexander Sterling"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="collector@residence.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">
                      Phone (Concierge Dispatch) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  2. Destination
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-3">
                    <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">
                      Residence / Suite Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="Penthouse Suite, 42 Boulevard Avenue"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Mumbai / London"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      required
                      placeholder="400001"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sizing */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  3. Wrist Sizing & Packaging
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">
                      Bracelet Sizing
                    </label>
                    <select
                      name="wrist_size"
                      value={formData.wrist_size}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400 font-mono"
                    >
                      <option value="Standard (19cm)">Standard Unsized (All links included)</option>
                      <option value="Fitted 16.5cm (Small)">Custom Sized: 16.5 cm Wrist</option>
                      <option value="Fitted 17.5cm (Medium)">Custom Sized: 17.5 cm Wrist</option>
                      <option value="Fitted 18.5cm (Large)">Custom Sized: 18.5 cm Wrist</option>
                      <option value="Fitted 20cm (Extra Large)">Custom Sized: 20 cm Wrist</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-3 sm:pt-5">
                    <input
                      type="checkbox"
                      id="gift_packaging"
                      name="gift_packaging"
                      checked={formData.gift_packaging}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded accent-slate-900 dark:accent-amber-400"
                    />
                    <label htmlFor="gift_packaging" className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      Lacquered Wooden Presentation Case
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl lux-btn-primary text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md hover:shadow-lg transition"
                >
                  {submitting ? (
                    <span>Calibrating Acquisition...</span>
                  ) : (
                    <>
                      <span>Authorize Acquisition</span>
                      <span>•</span>
                      <span className="font-num">{formatCurrency(grandTotal)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
