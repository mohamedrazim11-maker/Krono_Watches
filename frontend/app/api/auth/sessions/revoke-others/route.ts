import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import * as sessionManager from '@/lib/server/sessionManager';

export async function POST(req: NextRequest) {
  try {
    const { user, session } = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const revokedCount = sessionManager.revokeAllUserSessions(
      user.id,
      session?.id || null
    );

    return NextResponse.json({
      success: true,
      message: `Revoked ${revokedCount} other active session(s).`,
      revokedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
