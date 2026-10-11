"use client";

import React, { useEffect, useState, useRef } from "react";
import { PAYHERE_SANDBOX_URL } from "@/lib/payhere";

export interface PayHereCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface PayHereFormProps {
  orderId: string;
  amount: number;
  currency?: string;
  itemsDescription: string;
  customer: PayHereCustomer;
  isSubmitting?: boolean;
}

interface PayHerePaymentFields {
  merchant_id: string;
  order_id: string;
  amount: string;
  currency: string;
  hash: string;
}

export default function PayHereForm({
  orderId,
  amount,
  currency = "LKR",
  itemsDescription,
  customer,
  isSubmitting = false,
}: PayHereFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [showHashBreakdown, setShowHashBreakdown] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    requestKey: string;
    fields: PayHerePaymentFields;
  } | null>(null);
  const [hashFailure, setHashFailure] = useState<{
    requestKey: string;
    message: string;
  } | null>(null);

  const formattedAmount = Number(amount).toFixed(2);
  const paymentRequestKey = `${orderId}|${formattedAmount}`;
  const paymentFields =
    paymentResult?.requestKey === paymentRequestKey ? paymentResult.fields : null;
  const hashError =
    hashFailure?.requestKey === paymentRequestKey ? hashFailure.message : "";
  const paymentAmount = paymentFields?.amount || formattedAmount;
  const paymentCurrency = paymentFields?.currency || currency;

  // Split name into first and last name
  const nameParts = (customer.fullName || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "Client";
  const lastName = nameParts.slice(1).join(" ") || "Customer";

  useEffect(() => {
    if (!orderId || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    let isCurrentRequest = true;
    const requestKey = `${orderId}|${formattedAmount}`;

    fetch("/api/orders/payhere-hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then(async (response) => {
        const payload: {
          success?: boolean;
          message?: string;
          data?: PayHerePaymentFields;
        } = await response.json();
        const fields = payload.data;
        if (
          !response.ok ||
          payload.success !== true ||
          !fields ||
          fields.order_id !== orderId ||
          fields.amount !== formattedAmount ||
          fields.currency !== currency ||
          !fields.merchant_id ||
          !/^[A-F0-9]{32}$/.test(fields.hash)
        ) {
          throw new Error(payload.message || "Unable to prepare PayHere payment.");
        }
        if (isCurrentRequest) {
          setPaymentResult({
            requestKey,
            fields,
          });
          setHashFailure(null);
        }
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) return;
        setHashFailure({
          requestKey,
          message:
            error instanceof Error ? error.message : "Unable to prepare PayHere payment.",
        });
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [orderId, amount, formattedAmount, currency]);

  useEffect(() => {
    const formElement = formRef.current;
    if (!formElement) return;

    const handleSubmitListener = () => {
      const origin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, "");
      const returnUrl = formElement.querySelector<HTMLInputElement>('[name="return_url"]');
      const cancelUrl = formElement.querySelector<HTMLInputElement>('[name="cancel_url"]');
      const notifyUrl = formElement.querySelector<HTMLInputElement>('[name="notify_url"]');
      if (returnUrl) {
        returnUrl.value = `${origin}/checkout?payment=success&order_id=${encodeURIComponent(orderId)}`;
      }
      if (cancelUrl) {
        cancelUrl.value = `${origin}/checkout?payment=cancelled&order_id=${encodeURIComponent(orderId)}`;
      }
      if (notifyUrl) {
        notifyUrl.value = `${origin}/api/orders/payhere-notify`;
      }
    };

    formElement.addEventListener("submit", handleSubmitListener);
    return () => {
      formElement.removeEventListener("submit", handleSubmitListener);
    };
  }, [orderId]);

  return (
    <div className="bg-[#0A0A0A] border border-[#C5A059]/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003B95] to-[#001D4A] border border-blue-400/40 flex items-center justify-center font-bold text-white text-base shadow-lg">
            💳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif font-bold text-white">
                PayHere Payment Gateway
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Sandbox Mode
              </span>
            </div>
            <p className="text-xs text-white/50 font-mono">
              Central Bank of Sri Lanka (CBSL) Compliant Payment Processing
            </p>
          </div>
        </div>

        {/* Payment logos / accepted types */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["VISA", "Mastercard", "AMEX", "eZ Cash", "Genie", "FriMi", "Online Banking"].map((badge) => (
            <span
              key={badge}
              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/70"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/60 border border-white/10 rounded-xl p-4 text-xs font-mono">
        <div>
          <span className="text-white/40 block text-[10px] uppercase">Order Reference (order_id)</span>
          <span className="text-[#C5A059] font-bold text-sm">{orderId}</span>
        </div>
        <div>
          <span className="text-white/40 block text-[10px] uppercase">Total Payable (amount)</span>
          <span className="text-emerald-400 font-bold text-sm">
            {currency} {formattedAmount}
          </span>
        </div>
        <div>
          <span className="text-white/40 block text-[10px] uppercase">Customer Details</span>
          <span className="text-white/90 truncate block">{customer.fullName} ({customer.email})</span>
        </div>
        <div>
          <span className="text-white/40 block text-[10px] uppercase">Security Hash Status</span>
          <span className="text-blue-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            {paymentFields ? "Server hash ready" : hashError ? "Hash unavailable" : "Preparing server hash"}
          </span>
        </div>
      </div>

      {/* Course Requirements / Interactive Hash Inspector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowHashBreakdown(!showHashBreakdown)}
            className="text-[#C5A059] hover:underline flex items-center gap-1 font-mono"
          >
            <span>{showHashBreakdown ? "▲ Hide" : "▼ Inspect"} PayHere Hash Formula Breakdown</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C5A059]/10 border border-[#C5A059]/30">
              E-Business Systems
            </span>
          </button>

        </div>

        {showHashBreakdown && (
          <div className="p-4 bg-black/90 border border-blue-500/30 rounded-xl space-y-2.5 text-[11px] font-mono text-white/80 animate-fadeIn">
            <div className="text-blue-400 font-bold uppercase tracking-wider text-[10px]">
              PayHere MD5 hash formula (calculated on the server)
            </div>
            <div className="space-y-1">
              <span className="text-white/40 block text-[10px]">1. Hashed merchant secret:</span>
              <div className="p-2 bg-black rounded border border-white/10 text-white/90 break-all">
                UPPERCASE(MD5(merchant_secret)) — retained on the server
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 block text-[10px]">2. Hash input:</span>
              <div className="p-2 bg-black rounded border border-white/10 text-white/90 break-all">
                {paymentFields
                  ? `${paymentFields.merchant_id} + ${paymentFields.order_id} + ${paymentFields.amount} + ${paymentFields.currency} + UPPERCASE(MD5(merchant_secret))`
                  : "Waiting for the server to prepare this order's payment hash."}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 block text-[10px]">3. Generated Mandatory Security Hash:</span>
              <div className="p-2 bg-black rounded border border-emerald-500/40 text-emerald-400 font-bold break-all">
                {paymentFields?.hash || "Not available"}
              </div>
            </div>
          </div>
        )}

        {hashError && (
          <p role="alert" className="text-xs text-red-300 font-mono">
            {hashError}
          </p>
        )}
      </div>

      {/* The Actual HTML Form Matching Slide Specification */}
      <form
        id="payhere_form"
        ref={formRef}
        method="POST"
        action={PAYHERE_SANDBOX_URL}
        className="space-y-4"
      >
        {/* Hidden inputs matching exact IDs and Names from course slide */}
        <input type="hidden" name="merchant_id" id="merchant_id" value={paymentFields?.merchant_id || ""} />
        <input type="hidden" name="return_url" defaultValue="" />
        <input type="hidden" name="cancel_url" defaultValue="" />
        <input type="hidden" name="notify_url" defaultValue="" />
        <input type="hidden" name="first_name" value={firstName} />
        <input type="hidden" name="last_name" value={lastName} />
        <input type="hidden" name="email" value={customer.email || "client@krono.luxury"} />
        <input type="hidden" name="phone" value={customer.phone || "+94 77 123 4567"} />
        <input type="hidden" name="address" value={customer.address || "Marina Boulevard"} />
        <input type="hidden" name="city" value={customer.city || "Colombo"} />
        <input type="hidden" name="country" value={customer.country || "Sri Lanka"} />
        <input type="hidden" name="order_id" id="order_id" value={paymentFields?.order_id || ""} />
        <input type="hidden" name="items" value={itemsDescription || "Krono Luxury Watch Order"} />
        <input type="hidden" name="currency" id="currency" value={paymentCurrency} />
        <input type="hidden" name="amount" id="amount" value={paymentAmount} />
        <input type="hidden" name="hash" id="hash" value={paymentFields?.hash || ""} />

        {/* Submission Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !paymentFields || amount <= 0}
            className="w-full py-4 bg-gradient-to-r from-[#C5A059] to-[#d4af37] hover:from-[#b08d48] hover:to-[#c5a059] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl hover:shadow-[#C5A059]/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Proceed to PayHere Secure Payment →</span>
            <span className="font-mono text-xs">({paymentCurrency} {paymentAmount})</span>
          </button>
        </div>
      </form>

      {/* Footer Info */}
      <div className="text-[10px] font-mono text-white/40 text-center leading-relaxed">
        Encrypted TLS 1.3 / 256-bit AES cryptographic transaction channel. No card numbers or credentials stored on uncertified nodes.
      </div>
    </div>
  );
}
