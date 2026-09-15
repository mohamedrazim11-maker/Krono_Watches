const jwt = require('jsonwebtoken');
const sessionManager = require('../utils/sessionManager');
const JWT_SECRET = process.env.JWT_SECRET || 'krono_jwt_secret_2026';

module.exports = function requireAuth(req, res, next) {
  let token = null;

  // 1. Primary: HTTP-Only cookie parsed by cookie-parser
  if (req.cookies && req.cookies.krono_token) {
    token = req.cookies.krono_token;
  }

  // 2. Secondary: Authorization Bearer header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // 3. Fallback: Raw Cookie header pattern match
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)krono_token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No valid session or token found.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { sub, name, email, avatar, role }

    // Session validation if session cookie is present
    const sessionId = req.cookies?.krono_session || (req.headers['x-krono-session-id']);
    if (sessionId) {
      const activeSession = sessionManager.getSession(sessionId);
      if (activeSession) {
        if (!activeSession.isValid) {
          sessionManager.clearAuthCookies(res);
          return res.status(401).json({
            success: false,
            message: 'Session has been terminated. Please sign in again.',
          });
        }
        sessionManager.touchSession(sessionId);
        req.session = activeSession;
      }
    }

    next();
  } catch (err) {
    // Clear cookies if token is expired or invalid
    sessionManager.clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
};
