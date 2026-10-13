import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getUserById } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const { user, session } = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          isAuthenticated: false,
          message: 'No active authenticated session.',
        },
        { status: 200 }
      );
    }

    const fullUser = await getUserById(user.id);
    const timeRemainingMs = session ? Math.max(0, session.expiresAt - Date.now()) : 0;

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      session: session
        ? {
            id: session.id,
            deviceLabel: session.deviceLabel,
            createdAt: session.createdAt,
            expiresAt: new Date(session.expiresAt).toISOString(),
            timeRemainingMs,
            rememberMe: session.rememberMe,
            cookieSecurity: {
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            },
          }
        : null,
      user: fullUser
        ? {
            id: fullUser.id,
            name: fullUser.name,
            email: fullUser.email,
            phone: fullUser.phone || null,
            address: fullUser.address || null,
            secondary_address: fullUser.secondary_address || null,
            avatar: fullUser.avatar || '/assets/u1.svg',
            role: fullUser.role || 'authenticated',
            status: fullUser.status || 'Active Member',
            created_at: fullUser.created_at,
          }
        : user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
