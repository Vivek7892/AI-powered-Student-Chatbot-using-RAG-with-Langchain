const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const {
  resetPasswordWithFirebaseOTP,
  signup,
  login,
  getCurrentUser
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/forgot-password/firebase-reset', resetPasswordWithFirebaseOTP);
router.post('/login', login);
router.post('/signup', signup);
router.get('/me', auth, getCurrentUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL.split(',')[0]}/login?error=oauth_failed` }),
  (req, res) => {
    try {
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.redirect(`${process.env.FRONTEND_URL.split(',')[0]}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL.split(',')[0]}/login?error=oauth_failed`);
    }
  }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL.split(',')[0]}/login?error=oauth_failed` }),
  (req, res) => {
    try {
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.redirect(`${process.env.FRONTEND_URL.split(',')[0]}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL.split(',')[0]}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
