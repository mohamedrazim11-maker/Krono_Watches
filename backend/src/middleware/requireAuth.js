const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'krono_jwt_secret_2026';

module.exports = function requireAuth(req, res, next) {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Fallback to HTTP-only cookie if header not provided
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)krono_token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { sub, name, email, avatar, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token. Please sign in again.' });
  }
};
