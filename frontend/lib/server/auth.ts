import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import * as sessionManager from './sessionManager';

export const JWT_SECRET = process.env.JWT_SECRET || 'krono_jwt_secret_2026';
export const JWT_EXPIRES = '7d';
export const JWT_EXPIRES_REMEMBER = '30d';
export const SALT_ROUNDS = 10;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export function generateToken(user: any, rememberMe = false): string {
  return jwt.sign(
    {
      sub: user.id || user.user_id,
      name: user.name || user.full_name,
      email: user.email,
      avatar: user.avatar || '/assets/u1.svg',
      role: user.role || 'customer',
    },
    JWT_SECRET,
    { expiresIn: rememberMe ? JWT_EXPIRES_REMEMBER : JWT_EXPIRES }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface AuthenticatedUser {
  sub: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export function getUserFromRequest(
  req: NextRequest
): { user: AuthenticatedUser | null; session: sessionManager.Session | null } {
  let token: string | null = null;

  // 1. Primary: Cookie krono_token
  token = req.cookies.get('krono_token')?.value || null;

  // 2. Secondary: Authorization Header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return { user: null, session: null };
  }

  try {
    const decoded = verifyToken(token) as any;
    const user: AuthenticatedUser = {
      sub: decoded.sub,
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      avatar: decoded.avatar,
      role: decoded.role || 'customer',
    };

    const sessionId = req.cookies.get('krono_session')?.value || req.headers.get('x-krono-session-id');
    let session: sessionManager.Session | null = null;
    if (sessionId) {
      const active = sessionManager.getSession(sessionId);
      if (active && active.isValid) {
        sessionManager.touchSession(sessionId);
        session = active;
      }
    }

    return { user, session };
  } catch {
    return { user: null, session: null };
  }
}

export function requireAdmin(
  req: NextRequest
): { authorized: boolean; user?: AuthenticatedUser; errorResponse?: any } {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return {
      authorized: false,
      errorResponse: { success: false, message: 'Authentication required.' },
    };
  }
  if (user.role !== 'admin') {
    return {
      authorized: false,
      errorResponse: { success: false, message: 'Access denied: Administrator privileges required.' },
    };
  }
  return { authorized: true, user };
}
