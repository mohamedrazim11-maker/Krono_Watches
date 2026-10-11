import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import * as sessionManager from '@/lib/server/sessionManager';

export async function GET(req: NextRequest) {
  try {
    const { user, session } = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const sessions = sessionManager.getUserActiveSessions(user.id, session?.id || null);
    return NextResponse.json({
      success: true,
      sessions,
      totalActive: sessions.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
