import { NextRequest, NextResponse } from 'next/server';
import { getPosters, updatePoster } from '@/lib/server/db';

export async function GET() {
  try {
    const data = await getPosters();
    return NextResponse.json({ success: true, data });
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
    const { section_id } = body;
    if (!section_id) {
      return NextResponse.json(
        { success: false, message: 'section_id is required' },
        { status: 400 }
      );
    }

    const data = await updatePoster(body);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
