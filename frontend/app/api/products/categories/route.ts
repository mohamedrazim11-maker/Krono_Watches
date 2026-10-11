import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/server/db';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
