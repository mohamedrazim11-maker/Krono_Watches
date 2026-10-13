import { NextRequest, NextResponse } from 'next/server';
import * as sessionManager from '@/lib/server/sessionManager';

export async function POST(req: NextRequest) {
  try {
    const sessionId =
      req.cookies.get('krono_session')?.value ||
      req.headers.get('x-krono-session-id');

    if (sessionId) {
      sessionManager.revokeSession(sessionId);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Client session successfully terminated.',
    });

    sessionManager.clearAuthCookies(response);
    return response;
  } catch {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out.',
    });
    sessionManager.clearAuthCookies(response);
    return response;
  }
}
