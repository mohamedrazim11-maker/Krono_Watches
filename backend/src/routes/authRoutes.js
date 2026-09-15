const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

// Public routes (Milestone 1 & 2)
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);

// Protected routes (Milestone 3 & 4 - require valid JWT / cookie / session)
router.get('/profile', requireAuth, auth.getProfile);
router.put('/profile', requireAuth, auth.updateProfile);
router.put('/change-password', requireAuth, auth.changePassword);

// Session & Cookie Management routes
router.get('/session', requireAuth, auth.getSession);
router.post('/session/refresh', requireAuth, auth.refreshSession);
router.get('/sessions', requireAuth, auth.getActiveSessions);
router.delete('/sessions/:sessionId', requireAuth, auth.revokeSessionById);
router.post('/sessions/revoke-others', requireAuth, auth.revokeOtherSessions);

module.exports = router;
