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
    <div className="space-y-3">
      {hashError && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 font-mono text-center">
          {hashError}
        </div>
      )}

      <button
        type="button"
        onClick={openOfficialPayHereModal}
        disabled={isSubmitting || modalLoading || !paymentFields}
        className="w-full py-4 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.18em] rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {modalLoading ? "Opening PayHere..." : "Pay with PayHere"}
      </button>

      {/* Fallback direct submission form if popups are blocked */}
      <form
        id="payhere_form"
        ref={formRef}
        method="POST"
        action={PAYHERE_SANDBOX_URL}
        className="hidden"
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
      </form>
    </div>
  );
}
