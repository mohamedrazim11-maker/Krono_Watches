import crypto from 'crypto';
import { NextResponse } from 'next/server';

export interface Session {
  id: string;
  userId: string;
  userAgent: string;
  deviceLabel: string;
  ip: string;
  rememberMe: boolean;
  createdAt: string;
  expiresAt: number;
  lastActive: string;
  isValid: boolean;
}

// In-Memory Session Store
const sessions = new Map<string, Session>();
const userSessionIndex = new Map<string, Set<string>>();

export const DEFAULT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const REMEMBER_ME_TTL_MS = 30 * 24 * 60 * 60 * 1000;    // 30 days

export function createSession({
  userId,
  userAgent = 'Unknown Device',
  ip = '127.0.0.1',
  rememberMe = false,
}: {
  userId: string;
  userAgent?: string;
  ip?: string;
  rememberMe?: boolean;
}): Session {
  const sessionId = 'ses_' + crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const ttl = rememberMe ? REMEMBER_ME_TTL_MS : DEFAULT_SESSION_TTL_MS;
  const expiresAt = now + ttl;

  let deviceLabel = 'Desktop Browser';
  if (/mobile/i.test(userAgent)) deviceLabel = 'Mobile Device';
  else if (/tablet/i.test(userAgent)) deviceLabel = 'Tablet Device';

  if (/chrome/i.test(userAgent)) deviceLabel += ' (Chrome)';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) deviceLabel += ' (Safari)';
  else if (/firefox/i.test(userAgent)) deviceLabel += ' (Firefox)';
  else if (/edg/i.test(userAgent)) deviceLabel += ' (Edge)';

  const session: Session = {
    id: sessionId,
    userId,
    userAgent,
    deviceLabel,
    ip,
    rememberMe,
    createdAt: new Date(now).toISOString(),
    expiresAt,
    lastActive: new Date(now).toISOString(),
    isValid: true,
  };

  sessions.set(sessionId, session);

  if (!userSessionIndex.has(userId)) {
    userSessionIndex.set(userId, new Set());
  }
  userSessionIndex.get(userId)!.add(sessionId);

  return session;
}

export function getSession(sessionId: string): Session | null {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session || !session.isValid) return null;
  if (session.expiresAt <= Date.now()) {
    revokeSession(sessionId);
    return null;
  }
  return session;
}

export function touchSession(sessionId: string) {
  const session = sessions.get(sessionId);
  if (session && session.isValid) {
    session.lastActive = new Date().toISOString();
  }
}

export function extendSession(sessionId: string, rememberMe = false): Session | null {
  const session = sessions.get(sessionId);
  if (session && session.isValid) {
    const ttl = rememberMe || session.rememberMe ? REMEMBER_ME_TTL_MS : DEFAULT_SESSION_TTL_MS;
    session.expiresAt = Date.now() + ttl;
    session.lastActive = new Date().toISOString();
    return session;
  }
  return null;
}

export function revokeSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (session) {
    session.isValid = false;
    sessions.delete(sessionId);
    const userSet = userSessionIndex.get(session.userId);
    if (userSet) {
      userSet.delete(sessionId);
      if (userSet.size === 0) userSessionIndex.delete(session.userId);
    }
    return true;
  }
  return false;
}

export function revokeAllUserSessions(userId: string, exceptSessionId: string | null = null): number {
  const userSet = userSessionIndex.get(userId);
  if (!userSet) return 0;

  let count = 0;
  for (const sId of Array.from(userSet)) {
    if (exceptSessionId && sId === exceptSessionId) continue;
    sessions.delete(sId);
    userSet.delete(sId);
    count++;
  }
  if (userSet.size === 0) userSessionIndex.delete(userId);
  return count;
}

export function getUserActiveSessions(userId: string, currentSessionId: string | null = null) {
  const userSet = userSessionIndex.get(userId);
  if (!userSet) return [];

  const now = Date.now();
  const list = [];
  for (const sId of userSet) {
    const s = sessions.get(sId);
    if (s && s.isValid && s.expiresAt > now) {
      list.push({
        id: s.id,
        deviceLabel: s.deviceLabel,
        ip: s.ip,
        lastActive: s.lastActive,
        createdAt: s.createdAt,
        expiresAt: new Date(s.expiresAt).toISOString(),
        isCurrent: currentSessionId === s.id,
        rememberMe: s.rememberMe,
      });
    }
  }
  return list;
}

export function setAuthCookies(
  res: NextResponse,
  token: string,
  user: any,
  session: Session
) {
  const isProd = process.env.NODE_ENV === 'production';
  const ttlMs = session.rememberMe ? REMEMBER_ME_TTL_MS : DEFAULT_SESSION_TTL_MS;
  const maxAgeSec = Math.floor(ttlMs / 1000);

  res.cookies.set('krono_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSec,
  });

  res.cookies.set('krono_session', session.id, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSec,
  });

  const clientPayload = JSON.stringify({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'authenticated',
    sessionId: session.id,
    expiresAt: session.expiresAt,
  });

  res.cookies.set('krono_client_session', Buffer.from(clientPayload).toString('base64'), {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSec,
  });
}

export function clearAuthCookies(res: NextResponse) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOpts = {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    maxAge: 0,
  };

  res.cookies.set('krono_token', '', cookieOpts);
  res.cookies.set('krono_session', '', cookieOpts);
  res.cookies.set('krono_client_session', '', { ...cookieOpts, httpOnly: false });
}
