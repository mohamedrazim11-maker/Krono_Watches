export const PAYHERE_SANDBOX_URL = "https://sandbox.payhere.lk/pay/checkout";
export const PAYHERE_LIVE_URL = "https://www.payhere.lk/pay/checkout";

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
