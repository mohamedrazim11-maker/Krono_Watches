# PayHere sandbox setup

1. Create/sign in to a developer account at [sandbox.payhere.lk](https://sandbox.payhere.lk).
2. Open **Integrations**, add an integration using the **Domain** type, and register the host used by the app. For plain local testing register `localhost`; if using a tunnel, register that tunnel hostname instead.
3. Open the integration and copy its numeric **Merchant ID** and generated **Merchant Secret**.
4. In `frontend`, copy `.env.example` to `.env.local`. Set `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET` to those sandbox values. Do not add the merchant secret to a `NEXT_PUBLIC_` variable or commit `.env.local`.
5. Start the website from the project with `npm run dev` and open it over HTTP at `http://localhost:3000` (not a `file://` URL).
6. To receive the server-to-server payment notification, expose the app through a public HTTPS tunnel and set `NEXT_PUBLIC_APP_URL` to that exact HTTPS base URL. Register the tunnel hostname with PayHere as the integration domain. A redirect back to localhost can work in the browser, but PayHere cannot deliver its notification to a private localhost URL.
7. Add a product to the cart, complete checkout with **PayHere Payment Gateway**, and pay with a sandbox test card. The site creates a pending order; the server calculates the hash from that stored order and the server-only merchant credentials, then submits the form to `https://sandbox.payhere.lk/pay/checkout`. Only a valid PayHere notification can mark the order as paid.

The submitted form includes the required merchant/order/item fields, a two-decimal LKR amount, customer details, return/cancel/notification URLs, and the PayHere MD5 hash. The hash formula is `UPPERCASE(MD5(merchant_id + order_id + amount + currency + UPPERCASE(MD5(merchant_secret))))`.

Use one of the course-provided sandbox cards on PayHere's hosted payment page:

- Visa: `4916 2175 0161 1292`
- Mastercard: `5307 7321 2553 1191`
- Expiry: any future date (for example, `12/28`); CVV: any three digits (for example, `123`)

The test card is entered only on PayHere's hosted sandbox page; this store does not collect card details.
