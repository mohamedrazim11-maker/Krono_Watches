const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const sessionManager = require('../utils/sessionManager');

const JWT_SECRET = process.env.JWT_SECRET || 'krono_jwt_secret_2026';
const JWT_EXPIRES = '7d';
const JWT_EXPIRES_REMEMBER = '30d';
const SALT_ROUNDS = 10;

// ─── Email & Password Validators ────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// Helper to generate compliant decoded JWT payload
function generateToken(user, rememberMe = false) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '/assets/u1.svg',
      role: user.role || 'authenticated',
    },
    JWT_SECRET,
    { expiresIn: rememberMe ? JWT_EXPIRES_REMEMBER : JWT_EXPIRES }
  );
}

// ─── POST /api/register & /api/auth/register (Milestone 1) ───────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, password, confirmPassword) are required.' });
    }

    // Validate email format with regex
    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Validate password complexity with regex
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
      });
    }

    // Validate password confirmation match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // 1. checkUserExists()
    const existing = await db.getUserByEmail(email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // 2. hashedPw = bcrypt.hash()
    const hashedPw = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. db.Users.insert() / createUser()
    const user = await db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      hashedPw,
    });

    // 4. Session & Cookie Management: Create active session and set secure cookies
    const session = sessionManager.createSession({
      userId: user.id,
      userAgent: req.headers['user-agent'] || 'Web Browser',
      ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
      rememberMe: false,
    });

    const token = generateToken(user, false);
    sessionManager.setAuthCookies(res, token, user, session);

    // 5. Response with token, user data, and session summary
    res.status(201).json({
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
        role: 'authenticated',
        status: user.status || 'Active Member',
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── POST /api/login & /api/auth/login (Milestone 2) ─────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // 1. Credential verification: retrieve user by email
    const user = await db.getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 2. Verify password hash using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const shouldRemember = Boolean(rememberMe);

    // 3. Session Management: Create persistent or session-based active record
    const session = sessionManager.createSession({
      userId: user.id,
      userAgent: req.headers['user-agent'] || 'Web Browser',
      ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
      rememberMe: shouldRemember,
    });

    // 4. State persistence: Sign JWT + set secure HTTP-only & client cookies
    const token = generateToken(user, shouldRemember);
    sessionManager.setAuthCookies(res, token, user, session);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
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
        phone: user.phone || '',
        address: user.address || '',
        secondary_address: user.secondary_address || '',
        avatar: user.avatar || '/assets/u1.svg',
        role: user.role || 'authenticated',
        status: user.status || 'Active Member',
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── POST /api/logout & /api/auth/logout (Milestone 3) ───────────────────────
exports.logout = (req, res) => {
  const sessionId = req.cookies?.krono_session || req.headers['x-krono-session-id'];
  if (sessionId) {
    sessionManager.revokeSession(sessionId);
  }

  sessionManager.clearAuthCookies(res);
  res.status(200).json({
    success: true,
    message: 'Signed out successfully. Active session revoked and cookies cleared.',
  });
};

// ─── GET /api/session & /api/auth/session (Session Verification & Health) ────
exports.getSession = async (req, res) => {
  try {
    const user = await db.getUserById(req.user.sub);
    if (!user) {
      sessionManager.clearAuthCookies(res);
      return res.status(404).json({ success: false, message: 'Authenticated user record not found.' });
    }

    const sessionId = req.cookies?.krono_session || req.headers['x-krono-session-id'];
    const session = sessionId ? sessionManager.getSession(sessionId) : req.session;

    const expiresAt = session ? session.expiresAt : Date.now() + 7 * 24 * 60 * 60 * 1000;
    const timeRemainingMs = Math.max(0, expiresAt - Date.now());

    res.status(200).json({
      success: true,
      isAuthenticated: true,
      session: {
        id: session?.id || 'jwt_stateless_session',
        deviceLabel: session?.deviceLabel || 'Current Browser',
        createdAt: session?.createdAt || new Date().toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        timeRemainingMs,
        rememberMe: session?.rememberMe || false,
        cookieSecurity: {
          httpOnly: true,
          sameSite: 'Lax',
          secure: process.env.NODE_ENV === 'production',
        },
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        secondary_address: user.secondary_address || '',
        avatar: user.avatar || '/assets/u1.svg',
        role: user.role || 'authenticated',
        status: user.status || 'Active Member',
      },
    });
  } catch (err) {
    console.error('getSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/session/refresh & /api/auth/session/refresh (Session Keep-Alive) ───
exports.refreshSession = async (req, res) => {
  try {
    const user = await db.getUserById(req.user.sub);
    if (!user) {
      sessionManager.clearAuthCookies(res);
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const sessionId = req.cookies?.krono_session || req.headers['x-krono-session-id'];
    let session = sessionId ? sessionManager.getSession(sessionId) : null;

    if (session) {
      session = sessionManager.extendSession(sessionId);
    } else {
      session = sessionManager.createSession({
        userId: user.id,
        userAgent: req.headers['user-agent'] || 'Web Browser',
        ip: req.ip || '127.0.0.1',
      });
    }

    const token = generateToken(user, session.rememberMe);
    sessionManager.setAuthCookies(res, token, user, session);

    res.status(200).json({
      success: true,
      message: 'Session refreshed successfully.',
      token,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        timeRemainingMs: session.expiresAt - Date.now(),
      },
    });
  } catch (err) {
    console.error('refreshSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/sessions & /api/auth/sessions (Active Devices / Sessions) ──────
exports.getActiveSessions = async (req, res) => {
  try {
    const currentSessionId = req.cookies?.krono_session || req.headers['x-krono-session-id'];
    const activeSessions = sessionManager.getUserActiveSessions(req.user.sub, currentSessionId);

    res.status(200).json({
      success: true,
      sessions: activeSessions,
      totalActive: activeSessions.length,
    });
  } catch (err) {
    console.error('getActiveSessions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/sessions/:sessionId (Revoke Specific Session) ───────────────
exports.revokeSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const currentSessionId = req.cookies?.krono_session || req.headers['x-krono-session-id'];

    const session = sessionManager.getSession(sessionId);
    if (!session || session.userId !== req.user.sub) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized.' });
    }

    sessionManager.revokeSession(sessionId);

    // If revoking current session, clear cookies
    if (sessionId === currentSessionId) {
      sessionManager.clearAuthCookies(res);
    }

    res.status(200).json({ success: true, message: 'Session successfully revoked.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/sessions/revoke-others (Revoke All Other Sessions) ────────────
exports.revokeOtherSessions = async (req, res) => {
  try {
    const currentSessionId = req.cookies?.krono_session || req.headers['x-krono-session-id'];
    const revokedCount = sessionManager.revokeAllUserSessions(req.user.sub, currentSessionId);

    res.status(200).json({
      success: true,
      message: `Terminated ${revokedCount} other active session(s).`,
      revokedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/profile & /api/auth/profile (Milestone 4 - Protected) ──────────
exports.getProfile = async (req, res) => {
  try {
    const user = await db.getUserById(req.user.sub);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        secondary_address: user.secondary_address || '',
        avatar: user.avatar || '/assets/u1.svg',
        role: user.role || 'authenticated',
        status: user.status || 'Active Member',
        created_at: user.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/profile & /api/auth/profile (Milestone 4 - Protected) ──────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, secondary_address } = req.body;
    const user = await db.updateUser(req.user.sub, {
      name,
      phone,
      address,
      secondary_address,
    });
    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        secondary_address: user.secondary_address || '',
        avatar: user.avatar || '/assets/u1.svg',
        status: user.status || 'Active Member',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/change-password & /api/auth/change-password (Milestone 4) ──────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'Current password, new password, and confirmation are required.' });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters with uppercase, lowercase, number & symbol.',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    const user = await db.getUserById(req.user.sub);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Re-verify identity with current password hash
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect. Identity verification failed.' });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.updateUser(req.user.sub, { password_hash: newHash });

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
