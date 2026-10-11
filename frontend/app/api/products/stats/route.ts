import { NextResponse } from 'next/server';
import { getStats } from '@/lib/server/db';

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
