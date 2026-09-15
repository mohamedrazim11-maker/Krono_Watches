const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

// Public routes
router.post('/register', auth.register);
router.post('/login', auth.login);

// Protected routes (require valid JWT)
router.get('/profile', requireAuth, auth.getProfile);
router.put('/profile', requireAuth, auth.updateProfile);
router.put('/change-password', requireAuth, auth.changePassword);

module.exports = router;
