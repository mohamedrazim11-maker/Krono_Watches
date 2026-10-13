import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') || undefined;
    const search = searchParams.get('search') || undefined;

    const products = await getProducts({ category, featured, search });
    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
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
    const body = await req.json();
    const { name, price } = body;
    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Name and price are required.' },
        { status: 400 }
      );
    }

    const data = await createProduct(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
