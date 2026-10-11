import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/server/db';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart items are required to place an order.' },
        { status: 400 }
      );
    }

    const order = await createOrder(orderData);
    return NextResponse.json({ success: true, data: order, order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
