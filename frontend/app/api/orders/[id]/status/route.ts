import { NextRequest, NextResponse } from 'next/server';
import { updateOrder } from '@/lib/server/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { payment_status, status, payment_id, notes } = body;

    const updated = await updateOrder(id, {
      ...(payment_status && { payment_status }),
      ...(status && { status }),
      ...(payment_id && { payment_id }),
      ...(notes && { notes }),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
