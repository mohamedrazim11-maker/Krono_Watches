import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderById, updateOrder } from '@/lib/server/db';

export const runtime = 'nodejs';

function hasValidSignature(body: Record<string, string>, merchantId: string, merchantSecret: string) {
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret.trim())
    .digest('hex')
    .toUpperCase();
  const expected = crypto
    .createHash('md5')
    .update(
      `${merchantId.trim()}${body.order_id}${body.payhere_amount}${body.payhere_currency}${body.status_code}${hashedSecret}`
    )
    .digest('hex')
    .toUpperCase();
  const received = String(body.md5sig || '').toUpperCase();

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  );
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    }

    const { order_id, payment_id, status_code, status_message } = body;
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret || !order_id || !body.md5sig) {
      return new NextResponse('Invalid payment notification', { status: 400 });
    }

    if (String(body.merchant_id) !== merchantId.trim() || !hasValidSignature(body, merchantId, merchantSecret)) {
      return new NextResponse('Invalid payment notification', { status: 400 });
    }

    const order = await getOrderById(order_id);
    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    if (
      Number(body.payhere_amount).toFixed(2) !== Number(order.total_amount).toFixed(2) ||
      String(body.payhere_currency) !== 'LKR'
    ) {
      return new NextResponse('Payment amount or currency mismatch', { status: 400 });
    }

    let paymentStatus = 'pending';
    let orderStatus = 'pending_payment';

    if (String(status_code) === '2') {
      paymentStatus = 'paid';
      orderStatus = 'confirmed';
    } else if (String(status_code) === '-1') {
      paymentStatus = 'cancelled';
      orderStatus = 'cancelled';
    } else if (String(status_code) === '-2') {
      paymentStatus = 'failed';
      orderStatus = 'failed';
    }

    await updateOrder(order_id, {
      payment_status: paymentStatus,
      status: orderStatus,
      payment_id: payment_id || null,
      payhere_status_code: status_code,
      payhere_status_message: status_message || null,
      paid_at: String(status_code) === '2' ? new Date().toISOString() : null,
    });

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('[PayHere IPN Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
