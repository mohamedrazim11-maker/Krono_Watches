import { NextRequest, NextResponse } from 'next/server';
import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  hashPassword,
  generateToken,
} from '@/lib/server/auth';
import { getUserByEmail, createUser } from '@/lib/server/db';
import * as sessionManager from '@/lib/server/sessionManager';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            'All fields (name, email, password, confirmPassword) are required.',
        },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format.' },
        { status: 400 }
      );
    }

    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email.trim().toLowerCase());
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email already exists.',
        },
        { status: 409 }
      );
    }

    const hashedPw = await hashPassword(password);
    const user = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      hashedPw,
    });

    const userAgent = req.headers.get('user-agent') || 'Web Browser';
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const session = sessionManager.createSession({
      userId: user.id,
      userAgent,
      ip: typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1',
      rememberMe: false,
    });

    const token = generateToken(user, false);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Client account created successfully.',
        token,
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
          deviceLabel: session.deviceLabel,
          createdAt: session.createdAt,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || '/assets/u1.svg',
          role: user.role || 'authenticated',
          status: user.status || 'Active Member',
          created_at: user.created_at,
        },
      },
      { status: 201 }
    );

    sessionManager.setAuthCookies(response, token, user, session);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
