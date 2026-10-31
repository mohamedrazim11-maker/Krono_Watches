export const PAYHERE_SANDBOX_URL = "https://sandbox.payhere.lk/pay/checkout";
export const PAYHERE_LIVE_URL = "https://www.payhere.lk/pay/checkout";
export const PAYHERE_SCRIPT_URL = "https://www.payhere.lk/lib/payhere.js";

declare global {
  interface Window {
    payhere?: {
      startPayment: (payment: any) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: string) => void;
    };
  }
}

export interface PayHereFormData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  hash: string;
}

export interface PayHerePaymentParams {
  sandbox?: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string | number;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_country?: string;
}

export interface PayHereCallbacks {
  onCompleted?: (orderId: string) => void;
  onDismissed?: () => void;
  onError?: (error: string) => void;
}

/**
 * Dynamically loads the official PayHere JS SDK script
 */
export function loadPayHereScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    if (window.payhere) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${PAYHERE_SCRIPT_URL}"]`);
    if (existingScript) {
      if (window.payhere) {
        resolve();
      } else {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", (e) => reject(e));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = PAYHERE_SCRIPT_URL;
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error("Failed to load official PayHere payment script."));
    document.body.appendChild(script);
  });
}

/**
 * Direct Form Redirect to PayHere Sandbox / Live Hosted Checkout
 * This avoids iframe cookie blocking and modal spinner freezing in modern browsers.
 */
export function redirectToPayHereCheckout(params: PayHerePaymentParams): void {
  if (typeof document === "undefined") return;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = params.sandbox !== false ? PAYHERE_SANDBOX_URL : PAYHERE_LIVE_URL;
  form.target = "_self";
  form.style.display = "none";

  const payload: Record<string, string> = {
    merchant_id: String(params.merchant_id || ""),
    return_url: params.return_url || "",
    cancel_url: params.cancel_url || "",
    notify_url: params.notify_url || "",
    order_id: String(params.order_id || ""),
    items: params.items || "Krono Order",
    currency: params.currency || "LKR",
    amount: typeof params.amount === "number" ? params.amount.toFixed(2) : String(params.amount || "0.00"),
    hash: params.hash || "",
    first_name: params.first_name || "Customer",
    last_name: params.last_name || "Client",
    email: params.email || "",
    phone: params.phone || "",
    address: params.address || "",
    city: params.city || "",
    country: params.country || "Sri Lanka",
    delivery_address: params.delivery_address || params.address || "",
    delivery_city: params.delivery_city || params.city || "",
    delivery_country: params.delivery_country || params.country || "Sri Lanka",
  };

  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = String(v);
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
}

/**
 * Triggers PayHere payment via direct hosted redirect.
 * Uses top-level navigation to prevent iframe cookie blocking and spinner freezing.
 */
export async function launchPayHerePayment(
  params: PayHerePaymentParams,
  callbacks?: PayHereCallbacks
): Promise<void> {
  redirectToPayHereCheckout(params);
}
