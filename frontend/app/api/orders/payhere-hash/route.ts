import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderById } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'A valid orderId is required.' },
        { status: 400 }
      );
    }

    const orderId =
      body && typeof body === 'object' && 'orderId' in body
        ? body.orderId
        : undefined;
    if (typeof orderId !== 'string' || !orderId.trim()) {
      return NextResponse.json(
        { success: false, message: 'A valid orderId is required.' },
        { status: 400 }
      );
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId?.trim() || !merchantSecret?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'PayHere merchant credentials are not configured on the server.',
        },
        { status: 503 }
      );
    }

    const order = await getOrderById(orderId.trim());
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Checkout order not found.' },
        { status: 404 }
      );
    }
    if (order.payment_method !== 'payhere' || order.payment_status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'This order is not awaiting a PayHere payment.' },
        { status: 409 }
      );
    }

    const amount = Number(order.total_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'The checkout order has an invalid payment amount.' },
        { status: 409 }
      );
    }

    const normalizedMerchantId = merchantId.trim();
    const normalizedOrderId = orderId.trim();
    const currency = 'LKR';
    const formattedAmount = amount.toFixed(2);
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret.trim())
      .digest('hex')
      .toUpperCase();
    const hashString =
      normalizedMerchantId + normalizedOrderId + formattedAmount + currency + hashedSecret;
    const generatedHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    return NextResponse.json({
      success: true,
      data: {
        merchant_id: normalizedMerchantId,
        order_id: normalizedOrderId,
        amount: formattedAmount,
        currency,
        hash: generatedHash,
      },
    });
  } catch (error: unknown) {
    console.error('[PayHere hash error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to prepare PayHere payment.',
      },
      { status: 500 }
    );
  }
}
