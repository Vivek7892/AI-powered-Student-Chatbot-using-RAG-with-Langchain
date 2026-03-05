const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const {
  sendForgotPasswordLink,
  resetPassword,
  signup,
  login,
  getCurrentUser
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();
const getFrontendBaseUrl = () => (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0];
const frontendPattern = /^https?:\/\/[^/\s]+$/i;
const normalizeFrontendBase = (rawFrontendBase) => {
  const value = String(rawFrontendBase || '').trim().replace(/\/+$/, '');
  if (!frontendPattern.test(value)) {
    return getFrontendBaseUrl();
  }
  return value;
};

const encodeState = (stateObj) => Buffer.from(JSON.stringify(stateObj)).toString('base64url');
const decodeState = (state) => {
  try {
    if (!state) {
      return {};
    }
    return JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
  } catch (error) {
    return {};
  }
};

router.post('/forgot-password/send-link', sendForgotPasswordLink);
router.post('/forgot-password/reset', resetPassword);
router.post('/login', login);
router.post('/signup', signup);
router.get('/me', auth, getCurrentUser);

// Google OAuth
router.get('/google', (req, res, next) => {
  if (!passport.hasGoogleOAuth) {
    return res.status(503).json({ error: 'Google login is not configured on server' });
  }
  const mode = req.query.mode || 'login';
  const email = req.query.email || '';
  const frontend = normalizeFrontendBase(req.query.frontend);
  const state = encodeState({ mode, email, frontend });
  return passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${getFrontendBaseUrl()}/login?error=oauth_failed` }),
  (req, res) => {
    try {
      const state = decodeState(req.query.state);
      const frontendBase = normalizeFrontendBase(state.frontend);
      const googleEmail = String(req.user.email || '').toLowerCase();
      const requestedEmail = String(state.email || '').toLowerCase();

      if (state.mode === 'forgot') {
        if (!requestedEmail || requestedEmail !== googleEmail) {
          return res.redirect(`${frontendBase}/login?mode=forgot&error=google_email_mismatch`);
        }

        const resetPasswordToken = jwt.sign(
          { email: requestedEmail, purpose: 'google_reset_verified' },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );

        return res.redirect(
          `${frontendBase}/login?mode=forgot&email=${encodeURIComponent(requestedEmail)}&resetPasswordToken=${encodeURIComponent(resetPasswordToken)}`
        );
      }

      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.redirect(`${frontendBase}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${getFrontendBaseUrl()}/login?error=oauth_failed`);
    }
  }
);

router.get('/github', (req, res, next) => {
  if (!passport.hasGithubOAuth) {
    return res.status(503).json({ error: 'GitHub login is not configured on server' });
  }
  const frontend = normalizeFrontendBase(req.query.frontend);
  const state = encodeState({ frontend });
  return passport.authenticate('github', { scope: ['user:email'], state })(req, res, next);
});
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${getFrontendBaseUrl()}/login?error=oauth_failed` }),
  (req, res) => {
    try {
      const state = decodeState(req.query.state);
      const frontendBase = normalizeFrontendBase(state.frontend);
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.redirect(`${frontendBase}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      return res.redirect(`${getFrontendBaseUrl()}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
