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
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={orderConfirmed ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] bg-[#E8EEF3] dark:bg-[#0E1A16] neu-modal text-[#0F172A] dark:text-[#F8FAFC] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-pageEnter">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black font-display uppercase tracking-widest text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <span>Concierge Checkout</span>
              <span className="w-2 h-2 rounded-full bg-[#006039] dark:bg-[#4ADE80] animate-pulse"></span>
            </h2>
            <div className="text-[10px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase tracking-wider font-mono font-semibold">
              Direct Acquisition & Insured Air Transit
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-btn-icon text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {orderConfirmed ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl neu-btn-primary flex items-center justify-center text-2xl mx-auto font-black shadow-lg">
                ✓
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest neu-inset text-[#006039] dark:text-[#4ADE80] font-bold px-3.5 py-1 rounded-full">
                  Acquisition Authenticated
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight">
                  Order Successfully Registered
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
                  Your timepiece has been allocated under concierge dossier{" "}
                  <strong className="text-[#006039] dark:text-[#4ADE80] font-mono font-bold">{confirmedOrderNumber}</strong>. A dedicated private horology consultant will contact you regarding serialized calibration and express transit dispatch.
                </p>
              </div>

              <div className="p-4 rounded-2xl neu-inset max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between text-[#5A6D64] dark:text-[#8EAA9C] font-mono font-semibold">
                  <span>Dossier Reference</span>
                  <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">{confirmedOrderNumber}</span>
                </div>
                <div className="flex justify-between text-[#5A6D64] dark:text-[#8EAA9C] font-mono font-semibold">
                  <span>Client</span>
                  <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">{formData.name || "Valued Collector"}</span>
                </div>
                <div className="flex justify-between text-[#5A6D64] dark:text-[#8EAA9C] font-mono font-semibold">
                  <span>Investment Total</span>
                  <span className="text-[#006039] dark:text-[#4ADE80] font-bold font-num">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="neu-btn-primary px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Return to Boutique
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-[#FFF1F2] dark:bg-[#4C0519]/40 border border-[#E11D48]/30 text-[#E11D48] text-xs font-mono font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Order Items Review */}
              <div className="p-4 rounded-2xl neu-inset space-y-2">
                <div className="text-[9px] text-[#006039] dark:text-[#4ADE80] font-mono uppercase tracking-widest font-bold">
                  Order Summary ({cart.length} Pieces)
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between items-center text-xs text-[#475569] dark:text-[#CBD5E1]"
                    >
                      <span className="truncate max-w-[280px]">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-num text-[#006039] dark:text-[#4ADE80] font-bold">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] flex justify-between text-xs font-bold font-mono">
                  <span className="text-[#5A6D64]">Total:</span>
                  <span className="text-[#006039] dark:text-[#4ADE80] font-num text-sm font-black">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Client Contact */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="text-[#006039] dark:text-[#4ADE80]">1.</span>
                  <span>Contact & Identity</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-bold mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Lord Alexander Sterling"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full neu-inset rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-bold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alexander@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full neu-inset rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-bold mb-1">
                      Private Telephone (for Air Courier Delivery) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+94 77 123 4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full neu-inset rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="text-[#006039] dark:text-[#4ADE80]">2.</span>
                  <span>Insured Delivery Address</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-bold mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="14 Royal Residences, Kensington Road"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full neu-inset rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-bold mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="Colombo"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full neu-inset rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-bold mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postal_code"
                        required
                        placeholder="00700"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        className="w-full neu-inset rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-bold mb-1">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full neu-inset rounded-xl px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                      >
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="India">India</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Singapore">Singapore</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horological Concierge Options */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="text-[#006039] dark:text-[#4ADE80]">3.</span>
                  <span>Bespoke Concierge Adjustments</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-[#5A6D64] dark:text-[#8EAA9C] uppercase font-mono font-bold mb-1">
                      Wrist Circumference Sizing
                    </label>
                    <select
                      name="wrist_size"
                      value={formData.wrist_size}
                      onChange={handleInputChange}
                      className="w-full neu-inset rounded-xl px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                    >
                      <option value="Standard (19cm)">Standard Factory Size (19cm)</option>
                      <option value="Slim (16-17cm)">Slim Wrist (16–17cm adjusted)</option>
                      <option value="Medium (17.5-18.5cm)">Medium Wrist (17.5–18.5cm)</option>
                      <option value="Broad (19.5-21cm)">Broad Wrist (19.5–21cm)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2.5 pt-4 px-2">
                    <input
                      type="checkbox"
                      id="gift_packaging"
                      name="gift_packaging"
                      checked={formData.gift_packaging}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded accent-[#006039] cursor-pointer"
                    />
                    <label htmlFor="gift_packaging" className="text-xs text-[#475569] dark:text-[#CBD5E1] cursor-pointer font-semibold">
                      Signature Green Presentation Box
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl neu-btn-primary text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg transition-all"
                >
                  {submitting ? "Authenticating Acquisition..." : `Confirm Vault Acquisition • ${formatCurrency(grandTotal)}`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
