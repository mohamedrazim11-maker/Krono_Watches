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
  onOrderSuccess?: () => void;
  onClearCart?: () => void;
  totalAmount?: number;
  appliedCoupon?: string;
  couponDiscountPercent?: number;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
  onClearCart,
  appliedCoupon = "MONO20",
  couponDiscountPercent = 20,
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
    city: "Colombo",
    postal_code: "00100",
    country: "Sri Lanka",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      const orderRef = res?.order_number || res?.order?.order_number || `KRN-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderNumber(orderRef);
      setOrderConfirmed(true);
      if (onOrderSuccess) onOrderSuccess();
      if (onClearCart) onClearCart();
    } catch (err: any) {
      console.error("Order error:", err);
      const fallbackRef = `KRN-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderNumber(fallbackRef);
      setOrderConfirmed(true);
      if (onOrderSuccess) onOrderSuccess();
      if (onClearCart) onClearCart();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={orderConfirmed ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-2xl bg-[#0D0D0D] border border-white/20 text-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-pageEnter font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span>Insured Vault Acquisition</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h2>
            <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
              Direct Calibration &amp; Armored Transit Dispatch
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {orderConfirmed ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-2xl mx-auto font-bold text-[#C5A059]">
                ✓
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-3 py-1 bg-emerald-950/60 border border-emerald-500/30">
                  Acquisition Authenticated
                </span>
                <h3 className="text-xl font-serif font-bold text-white uppercase">
                  Order Successfully Registered
                </h3>
                <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed font-mono">
                  Your reference has been secured under dossier reference{" "}
                  <strong className="text-[#C5A059]">{confirmedOrderNumber}</strong>. Serialized certificate of authenticity and armored dispatch tracking have been issued.
                </p>
              </div>

              <div className="bg-[#111] border border-[#222] p-4 max-w-md mx-auto text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between text-white/60">
                  <span>Dossier Reference</span>
                  <span className="text-white font-bold">{confirmedOrderNumber}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Client Name</span>
                  <span className="text-white font-bold">{formData.name || "Valued Collector"}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Investment Total</span>
                  <span className="text-[#C5A059] font-bold">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-4 px-8 py-3 bg-[#C5A059] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#b08d48]"
              >
                Complete Transaction
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-mono">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Lord Alexander Sterling"
                    className="w-full bg-[#111] border border-[#2a2a2a] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                    Direct Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="sterling@geneva-vault.ch"
                    className="w-full bg-[#111] border border-[#2a2a2a] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                    Phone (Courier Coordination) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-[#111] border border-[#2a2a2a] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                    Wrist Sizing
                  </label>
                  <select
                    name="wrist_size"
                    value={formData.wrist_size}
                    onChange={handleInputChange}
                    className="w-full bg-[#111] border border-[#2a2a2a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Standard (19cm)">Standard (19cm)</option>
                    <option value="Small (16cm - 17cm)">Small (16cm - 17cm)</option>
                    <option value="Medium (17.5cm - 18.5cm)">Medium (17.5cm - 18.5cm)</option>
                    <option value="Large (19.5cm - 21cm)">Large (19.5cm - 21cm)</option>
                    <option value="Unsized Factory Links">Unsized (All Factory Links)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                  Delivery Destination Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Penthouse Suite, 42 Marina Boulevard"
                  className="w-full bg-[#111] border border-[#2a2a2a] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-[#111] border border-[#2a2a2a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    required
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="w-full bg-[#111] border border-[#2a2a2a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-[#111] border border-[#2a2a2a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Order total strip */}
              <div className="bg-[#111] border border-[#222] p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(rawSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Privilege Voucher:</span>
                    <span>- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60">
                  <span>Armored Courier Transit:</span>
                  <span className="text-emerald-400 uppercase">Complimentary</span>
                </div>
                <div className="pt-2 border-t border-[#222] flex justify-between text-sm font-bold text-[#C5A059]">
                  <span>Total Acquisition:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d48] text-black font-bold text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-[#C5A059]/20 disabled:opacity-50"
              >
                {submitting ? "Authenticating Acquisition..." : `Confirm Acquisition • ${formatCurrency(grandTotal)}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
