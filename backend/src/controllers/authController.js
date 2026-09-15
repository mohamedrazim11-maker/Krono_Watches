const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'krono_jwt_secret_2026';
const JWT_EXPIRES = '7d';
const SALT_ROUNDS = 10;

// ─── Email & Password Validators ────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// Helper to generate compliant decoded JWT payload
function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '/assets/u1.svg',
      role: user.role || 'authenticated',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
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

    // 4. State persistence: Sign JWT + set HTTP-only cookie
    const token = generateToken(user);
    res.cookie('krono_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
    });

    // 4. res.status(201).json()
    res.status(201).json({
      success: true,
      message: 'Client account created successfully.',
      token,
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
    const { email, password } = req.body;

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

    // 3. State persistence: Sign JWT with decoded payload structure (sub, name, avatar, role)
    const token = generateToken(user);
    res.cookie('krono_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
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
  res.clearCookie('krono_token', { path: '/' });
  res.status(200).json({ success: true, message: 'Signed out successfully. Tokens and cookies cleared.' });
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
