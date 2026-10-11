import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, generateToken } from '@/lib/server/auth';
import { getUserById } from '@/lib/server/db';
import * as sessionManager from '@/lib/server/sessionManager';

export async function POST(req: NextRequest) {
  try {
    const { user, session } = getUserFromRequest(req);
    if (!user || !session) {
      return NextResponse.json(
        { success: false, message: 'No active session to refresh.' },
        { status: 401 }
      );
    }

    const extended = sessionManager.extendSession(session.id, session.rememberMe);
    if (!extended) {
      return NextResponse.json(
        { success: false, message: 'Failed to extend session.' },
        { status: 400 }
      );
    }

    const fullUser = await getUserById(user.id);
    const token = generateToken(fullUser || user, extended.rememberMe);

    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed successfully.',
      session: {
        id: extended.id,
        expiresAt: new Date(extended.expiresAt).toISOString(),
        deviceLabel: extended.deviceLabel,
        createdAt: extended.createdAt,
        timeRemainingMs: Math.max(0, extended.expiresAt - Date.now()),
        rememberMe: extended.rememberMe,
      },
    });

    sessionManager.setAuthCookies(response, token, fullUser || user, extended);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
