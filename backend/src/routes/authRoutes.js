const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

// Public routes (Milestone 1 & 2)
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);

// Protected routes (Milestone 3 & 4 - require valid JWT / cookie)
router.get('/profile', requireAuth, auth.getProfile);
router.put('/profile', requireAuth, auth.updateProfile);
router.put('/change-password', requireAuth, auth.changePassword);

module.exports = router;
