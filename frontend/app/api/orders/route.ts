import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/server/db';
import { getUserFromRequest } from '@/lib/server/auth';

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
    const { user } = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'You must be logged in to place an order. Please sign in.' },
        { status: 401 }
      );
    }

    const orderData = await req.json();
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart items are required to place an order.' },
        { status: 400 }
      );
    }

    // Bind authenticated user identity to the order
    orderData.user_id = user.id || user.sub;
    if (!orderData.email) {
      orderData.email = user.email;
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
