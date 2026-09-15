const crypto = require('crypto');

// In-Memory Session Store with automatic TTL cleanup
// Schema: sessionId -> { id, userId, userAgent, ip, createdAt, expiresAt, lastActive, rememberMe, isValid }
const sessions = new Map();
const userSessionIndex = new Map(); // userId -> Set of sessionIds

const DEFAULT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const REMEMBER_ME_TTL_MS = 30 * 24 * 60 * 60 * 1000;    // 30 days

// Periodic Garbage Collector for expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt <= now || !session.isValid) {
      sessions.delete(id);
      const userSet = userSessionIndex.get(session.userId);
      if (userSet) {
        userSet.delete(id);
        if (userSet.size === 0) userSessionIndex.delete(session.userId);
      }
    }
  }
}, 15 * 60 * 1000);

/**
 * Creates a new tracked session for an authenticated user
 */
function createSession({ userId, userAgent = 'Unknown Device', ip = '127.0.0.1', rememberMe = false }) {
  const sessionId = 'ses_' + crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const ttl = rememberMe ? REMEMBER_ME_TTL_MS : DEFAULT_SESSION_TTL_MS;
  const expiresAt = now + ttl;

  // Basic user-agent parser for friendly device labels
  let deviceLabel = 'Desktop Browser';
  if (/mobile/i.test(userAgent)) deviceLabel = 'Mobile Device';
  else if (/tablet/i.test(userAgent)) deviceLabel = 'Tablet Device';
  
  if (/chrome/i.test(userAgent)) deviceLabel += ' (Chrome)';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) deviceLabel += ' (Safari)';
  else if (/firefox/i.test(userAgent)) deviceLabel += ' (Firefox)';
  else if (/edg/i.test(userAgent)) deviceLabel += ' (Edge)';

  const session = {
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
  userSessionIndex.get(userId).add(sessionId);

  return session;
}

/**
 * Retrieves a session if valid and not expired
 */
function getSession(sessionId) {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session || !session.isValid) return null;
  if (session.expiresAt <= Date.now()) {
    revokeSession(sessionId);
    return null;
  }
  return session;
}

/**
 * Updates last active timestamp for an ongoing session
 */
function touchSession(sessionId) {
  const session = sessions.get(sessionId);
  if (session && session.isValid) {
    session.lastActive = new Date().toISOString();
  }
}

/**
 * Extends session expiry (session refresh)
 */
function extendSession(sessionId, rememberMe = false) {
  const session = sessions.get(sessionId);
  if (session && session.isValid) {
    const ttl = rememberMe || session.rememberMe ? REMEMBER_ME_TTL_MS : DEFAULT_SESSION_TTL_MS;
    session.expiresAt = Date.now() + ttl;
    session.lastActive = new Date().toISOString();
    return session;
  }
  return null;
}

/**
 * Revokes a single session
 */
function revokeSession(sessionId) {
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

/**
 * Revokes all active sessions for a user (e.g. security reset)
 */
function revokeAllUserSessions(userId, exceptSessionId = null) {
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

/**
 * Returns all active sessions for a user
 */
function getUserActiveSessions(userId, currentSessionId = null) {
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

/**
 * Sets comprehensive secure authentication and session cookies on response
 */
function setAuthCookies(res, token, user, session) {
  const isProd = process.env.NODE_ENV === 'production';
  const ttlMs = session.rememberMe ? REMEMBER_ME_TTL_MS : DEFAULT_SESSION_TTL_MS;
  const maxAgeSec = Math.floor(ttlMs / 1000);

  // 1. Primary HTTP-only JWT Cookie (Shielded from XSS)
  res.cookie('krono_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ttlMs,
  });

  // 2. HTTP-only Session ID Cookie (Shielded from XSS)
  res.cookie('krono_session', session.id, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ttlMs,
  });

  // 3. Client-accessible public Session State Cookie (Non-sensitive, enables instant client hydration)
  const clientPayload = JSON.stringify({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'authenticated',
    sessionId: session.id,
    expiresAt: session.expiresAt,
  });

  res.cookie('krono_client_session', Buffer.from(clientPayload).toString('base64'), {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ttlMs,
  });
}

/**
 * Clears all authentication and session cookies on response
 */
function clearAuthCookies(res) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOpts = {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    expires: new Date(0),
  };

  res.clearCookie('krono_token', cookieOpts);
  res.clearCookie('krono_session', cookieOpts);
  res.clearCookie('krono_client_session', { ...cookieOpts, httpOnly: false });
}

module.exports = {
  createSession,
  getSession,
  touchSession,
  extendSession,
  revokeSession,
  revokeAllUserSessions,
  getUserActiveSessions,
  setAuthCookies,
  clearAuthCookies,
  DEFAULT_SESSION_TTL_MS,
  REMEMBER_ME_TTL_MS,
};
