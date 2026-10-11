import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import * as sessionManager from '@/lib/server/sessionManager';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { user, session: currentSession } = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { sessionId } = await params;
    const targetSession = sessionManager.getSession(sessionId);

    if (!targetSession) {
      return NextResponse.json(
        { success: false, message: 'Session not found or already expired.' },
        { status: 404 }
      );
    }

    if (targetSession.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to revoke this session.' },
        { status: 403 }
      );
    }

    sessionManager.revokeSession(sessionId);

    const isCurrentRevoked = currentSession?.id === sessionId;
    const response = NextResponse.json({
      success: true,
      message: 'Session revoked successfully.',
      isCurrentSession: isCurrentRevoked,
    });

    if (isCurrentRevoked) {
      sessionManager.clearAuthCookies(response);
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
