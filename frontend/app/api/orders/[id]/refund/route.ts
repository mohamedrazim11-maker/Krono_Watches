import { NextRequest, NextResponse } from 'next/server';
import { updateOrder, getOrderById } from '@/lib/server/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { reason, notes, method, bank_details } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, message: 'Refund reason is required.' },
        { status: 400 }
      );
    }

    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }

    if (existingOrder.refund_status === 'requested' || existingOrder.refund_status === 'refunded') {
      return NextResponse.json(
        { success: false, message: 'A refund has already been requested or processed for this order.' },
        { status: 400 }
      );
    }

    const updated = await updateOrder(id, {
      refund_status: 'requested',
      refund_reason: reason,
      refund_notes: notes || '',
      refund_method: method || 'original_payment',
      refund_bank_details: bank_details || null,
      refund_requested_at: new Date().toISOString(),
      status: 'refund_requested',
    });

    return NextResponse.json({
      success: true,
      message: 'Refund request submitted successfully.',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
