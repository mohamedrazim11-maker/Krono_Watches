"use client";

import React, { useEffect, useState, useRef } from "react";
import { PAYHERE_SANDBOX_URL, launchPayHerePayment } from "@/lib/payhere";

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
  onSuccess?: (orderId: string) => void;
  autoLaunch?: boolean;
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
  onSuccess,
  autoLaunch = true,
}: PayHereFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [hasAutoLaunched, setHasAutoLaunched] = useState(false);
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

  // Split name dynamically from customer's actual input
  const nameParts = (customer.fullName || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "Client";

  // Fetch security hash dynamically from backend
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

  // Launch the official PayHere UI modal
  const openOfficialPayHereModal = async () => {
    if (!paymentFields) return;
    setModalLoading(true);

    try {
      const origin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, "");
      await launchPayHerePayment(
        {
          sandbox: true,
          merchant_id: paymentFields.merchant_id,
          return_url: `${origin}/checkout?payment=success&order_id=${encodeURIComponent(orderId)}`,
          cancel_url: `${origin}/checkout?payment=cancelled&order_id=${encodeURIComponent(orderId)}`,
          notify_url: `${origin}/api/orders/payhere-notify`,
          order_id: paymentFields.order_id,
          items: itemsDescription || "Krono Order",
          amount: paymentFields.amount,
          currency: paymentFields.currency,
          hash: paymentFields.hash,
          first_name: firstName,
          last_name: lastName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          country: customer.country || "Sri Lanka",
        },
        {
          onCompleted: (completedId) => {
            if (onSuccess) {
              onSuccess(completedId);
            } else {
              window.location.href = `/checkout?payment=success&order_id=${encodeURIComponent(orderId)}`;
            }
          },
          onDismissed: () => {
            console.log("PayHere payment modal dismissed by user");
          },
          onError: (err) => {
            alert(`PayHere Notice: ${err}`);
          },
        }
      );
    } catch (e: any) {
      console.error("Failed to launch PayHere in-page modal, falling back to form submit:", e);
      formRef.current?.submit();
    } finally {
      setModalLoading(false);
    }
  };

  // Automatically launch original PayHere UI when hash is ready
  useEffect(() => {
    if (autoLaunch && paymentFields && !hasAutoLaunched) {
      setHasAutoLaunched(true);
      openOfficialPayHereModal();
    }
  }, [paymentFields, autoLaunch, hasAutoLaunched]);

  return (
    <div className="bg-[#0A0A0A] border border-[#C5A059]/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Top Gateway Header */}
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
              Central Bank of Sri Lanka (CBSL) Approved Payment Service
            </p>
          </div>
        </div>

        {/* Accepted Payment Cards */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["VISA", "Mastercard", "AMEX", "eZ Cash", "Genie", "FriMi"].map((badge) => (
            <span
              key={badge}
              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/70"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Dynamic Order & Customer Details (No Hardcoding) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/60 border border-white/10 rounded-xl p-4 text-xs font-mono">
        <div>
          <span className="text-white/40 block text-[10px] uppercase">Order Reference</span>
          <span className="text-[#C5A059] font-bold text-sm">{orderId}</span>
        </div>
        <div>
          <span className="text-white/40 block text-[10px] uppercase">Payable Total</span>
          <span className="text-emerald-400 font-bold text-sm">
            {currency} {formattedAmount}
          </span>
        </div>
        <div>
          <span className="text-white/40 block text-[10px] uppercase">Customer / Client</span>
          <span className="text-white/90 truncate block">{customer.fullName} ({customer.email})</span>
        </div>
        <div>
          <span className="text-white/40 block text-[10px] uppercase">Security Hash Status</span>
          <span className="text-blue-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            {paymentFields ? "Server hash verified" : hashError ? "Hash error" : "Generating security hash..."}
          </span>
        </div>
      </div>

      {/* Manual Sandbox Card Entry Guide for PayHere UI */}
      <div className="bg-[#12141A] border border-amber-500/30 rounded-xl p-4 space-y-2.5 text-xs font-mono">
        <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
          <span>💳 Enter Card Details Manually in PayHere Sandbox</span>
          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">
            TEST CREDENTIALS
          </span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed font-sans">
          In the PayHere checkout popup, click <strong className="text-white">VISA</strong> or <strong className="text-white">Mastercard</strong> and manually enter these test card numbers:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-black/60 p-2.5 rounded-lg border border-white/5">
          <div>
            <span className="text-white/40 block text-[9px] uppercase">Card Number</span>
            <span className="text-white font-mono font-bold select-all">4111 1111 1111 1111</span>
          </div>
          <div>
            <span className="text-white/40 block text-[9px] uppercase">Expiry</span>
            <span className="text-white font-mono select-all">12 / 28</span>
          </div>
          <div>
            <span className="text-white/40 block text-[9px] uppercase">CVV</span>
            <span className="text-white font-mono select-all">123</span>
          </div>
          <div>
            <span className="text-white/40 block text-[9px] uppercase">SMS OTP</span>
            <span className="text-white font-mono select-all">123456</span>
          </div>
        </div>
      </div>

      {hashError && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 font-mono">
          {hashError}
        </div>
      )}

      {/* Primary Action Button: Opens the Original PayHere UI Modal */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={openOfficialPayHereModal}
          disabled={isSubmitting || modalLoading || !paymentFields}
          className="w-full py-4 bg-gradient-to-r from-[#C5A059] to-[#d4af37] hover:from-[#b08d48] hover:to-[#c5a059] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl hover:shadow-[#C5A059]/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {modalLoading ? (
            <span>Opening PayHere Gateway...</span>
          ) : (
            <>
              <span>Pay with PayHere (Original Gateway) →</span>
              <span className="font-mono text-xs">({paymentCurrency} {paymentAmount})</span>
            </>
          )}
        </button>

        {/* Fallback direct submission form if popups are blocked */}
        <form
          id="payhere_form"
          ref={formRef}
          method="POST"
          action={PAYHERE_SANDBOX_URL}
          className="text-center"
        >
          <input type="hidden" name="merchant_id" value={paymentFields?.merchant_id || ""} />
          <input type="hidden" name="return_url" value={typeof window !== "undefined" ? `${window.location.origin}/checkout?payment=success&order_id=${encodeURIComponent(orderId)}` : ""} />
          <input type="hidden" name="cancel_url" value={typeof window !== "undefined" ? `${window.location.origin}/checkout?payment=cancelled&order_id=${encodeURIComponent(orderId)}` : ""} />
          <input type="hidden" name="notify_url" value={typeof window !== "undefined" ? `${window.location.origin}/api/orders/payhere-notify` : ""} />
          <input type="hidden" name="first_name" value={firstName} />
          <input type="hidden" name="last_name" value={lastName} />
          <input type="hidden" name="email" value={customer.email} />
          <input type="hidden" name="phone" value={customer.phone} />
          <input type="hidden" name="address" value={customer.address} />
          <input type="hidden" name="city" value={customer.city} />
          <input type="hidden" name="country" value={customer.country || "Sri Lanka"} />
          <input type="hidden" name="order_id" value={paymentFields?.order_id || ""} />
          <input type="hidden" name="items" value={itemsDescription || "Krono Order"} />
          <input type="hidden" name="currency" value={paymentCurrency} />
          <input type="hidden" name="amount" value={paymentAmount} />
          <input type="hidden" name="hash" value={paymentFields?.hash || ""} />

          <button
            type="submit"
            disabled={!paymentFields}
            className="text-[11px] font-mono text-[#8E95A5] hover:text-[#C5A059] underline mt-1 transition-colors cursor-pointer"
          >
            Popup not opening? Click here to continue on full page PayHere
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="text-[10px] font-mono text-white/40 text-center leading-relaxed">
        Encrypted TLS 1.3 cryptographic transaction. Card details are entered directly on PayHere&apos;s secured payment system.
      </div>
    </div>
  );
}
