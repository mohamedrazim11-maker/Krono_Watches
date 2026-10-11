import { NextRequest, NextResponse } from 'next/server';
import {
  EMAIL_REGEX,
  comparePassword,
  generateToken,
} from '@/lib/server/auth';
import { getUserByEmail } from '@/lib/server/db';
import * as sessionManager from '@/lib/server/sessionManager';

export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe = false } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@krono.luxury').toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';

    let user = await getUserByEmail(email.trim().toLowerCase());
    
    // Auto-provision admin user if logging in with valid environment admin credentials
    if (!user && email.trim().toLowerCase() === envAdminEmail && password === envAdminPassword) {
      user = {
        id: 'usr-admin-01',
        name: 'Krono Atelier Director',
        email: envAdminEmail,
        role: 'admin',
        status: 'Active Administrator',
        created_at: new Date().toISOString(),
      };
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials. Please verify your email and password.',
        },
        { status: 401 }
      );
    }

    let isMatch = false;
    if ((user.role === 'admin' || email.trim().toLowerCase() === envAdminEmail) && password === envAdminPassword) {
      isMatch = true;
    } else if (user.password_hash) {
      isMatch = await comparePassword(password, user.password_hash);
    }

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials. Please verify your email and password.',
        },
        { status: 401 }
      );
    }

    const userAgent = req.headers.get('user-agent') || 'Web Browser';
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const session = sessionManager.createSession({
      userId: user.id,
      userAgent,
      ip: typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1',
      rememberMe: Boolean(rememberMe),
    });

    const token = generateToken(user, Boolean(rememberMe));

    const response = NextResponse.json({
      success: true,
      message: 'Sign in successful. Session established.',
      token,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        deviceLabel: session.deviceLabel,
        createdAt: session.createdAt,
        rememberMe: session.rememberMe,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        address: user.address || null,
        secondary_address: user.secondary_address || null,
        avatar: user.avatar || '/assets/u1.svg',
        role: user.role || 'authenticated',
        status: user.status || 'Active Member',
        created_at: user.created_at,
      },
    });

    sessionManager.setAuthCookies(response, token, user, session);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
