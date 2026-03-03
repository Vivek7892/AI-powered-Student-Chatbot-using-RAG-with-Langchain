const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const UserDashboard = require('../models/UserDashboard');
const EmailOTP = require('../models/EmailOTP');

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const getOTPVerificationToken = (email, purpose) =>
  jwt.sign({ email, purpose }, process.env.JWT_SECRET, { expiresIn: '15m' });

const getFirebaseApiKey = () => process.env.FIREBASE_WEB_API_KEY || process.env.FIREBASE_API_KEY;

const verifyGoogleIdTokenWithFirebase = async (googleIdToken) => {
  const firebaseApiKey = getFirebaseApiKey();
  if (!firebaseApiKey) {
    throw new Error('Firebase API key is not configured on server');
  }

  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: googleIdToken })
  });
  const data = await response.json();

  if (!response.ok || !data.users || !data.users.length) {
    return null;
  }

  const account = data.users[0];
  const providerUserInfo = Array.isArray(account.providerUserInfo) ? account.providerUserInfo : [];
  const hasGoogleProvider = providerUserInfo.some((provider) => provider.providerId === 'google.com');

  return {
    email: account.email || '',
    emailVerified: Boolean(account.emailVerified),
    hasGoogleProvider
  };
};

const buildTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const sendOTPEmail = async (email, otp, emailPurpose = 'signup') => {
  const transporter = buildTransporter();
  if (!transporter) {
    return false;
  }

  const subject = emailPurpose === 'forgot_password'
    ? 'Your password reset verification code'
    : 'Your AI Student Assistant verification code';

  const intro = emailPurpose === 'forgot_password'
    ? 'Use this code to reset your password.'
    : 'Use this code to verify your email.';

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text: `${intro} Your verification code is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>${intro}</p><p>Your verification code is <strong>${otp}</strong>.</p><p>It will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>`
  });

  return true;
};

const ensureDashboardForUser = async (user) => {
  let dashboard = await UserDashboard.findOne({ userId: user._id });
  if (!dashboard) {
    dashboard = new UserDashboard({
      userId: user._id,
      personalizedContent: {
        welcomeMessage: `Welcome back, ${user.email.split('@')[0]}!`,
        learningGoals: [`Master ${user.semester} semester concepts`]
      }
    });
    await dashboard.save();
  }
};

const sendOtpForPurpose = async ({ email, purpose }) => {
  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await EmailOTP.deleteMany({ email, purpose });
  await EmailOTP.create({
    email,
    purpose,
    otpHash,
    expiresAt
  });

  const delivered = await sendOTPEmail(email, otp, purpose);
  const response = { message: 'OTP sent to your email' };
  if (!delivered && process.env.NODE_ENV !== 'production') {
    response.devOtp = otp;
    response.message = 'SMTP is not configured. Development OTP returned in response.';
  }
  return response;
};

const verifyOtpForPurpose = async ({ email, otp, purpose, tokenPurpose }) => {
  const otpRecord = await EmailOTP.findOne({
    email,
    purpose,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return { error: 'OTP expired or not found. Please request a new OTP.', status: 400 };
  }

  const incomingHash = hashOTP(otp);
  if (incomingHash !== otpRecord.otpHash) {
    otpRecord.attempts += 1;
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await EmailOTP.deleteMany({ email, purpose });
      return { error: 'Too many failed attempts. Request a new OTP.', status: 400 };
    }
    await otpRecord.save();
    return { error: 'Invalid OTP', status: 400 };
  }

  await EmailOTP.deleteMany({ email, purpose });
  const otpVerificationToken = getOTPVerificationToken(email, tokenPurpose);
  return { otpVerificationToken };
};

const sendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists. Please login.' });
    }

    const response = await sendOtpForPurpose({ email, purpose: 'signup' });

    return res.json(response);
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const result = await verifyOtpForPurpose({
      email,
      otp,
      purpose: 'signup',
      tokenPurpose: 'signup_otp_verified'
    });

    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    return res.json({
      message: 'OTP verified successfully',
      otpVerificationToken: result.otpVerificationToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email' });
    }

    const response = await sendOtpForPurpose({ email, purpose: 'forgot_password' });
    return res.json(response);
  } catch (error) {
    console.error('Send forgot password OTP error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const result = await verifyOtpForPurpose({
      email,
      otp,
      purpose: 'forgot_password',
      tokenPurpose: 'forgot_password_otp_verified'
    });

    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    return res.json({
      message: 'OTP verified successfully',
      resetPasswordToken: result.otpVerificationToken
    });
  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetPasswordToken } = req.body;

    if (!email || !newPassword || !resetPasswordToken) {
      return res.status(400).json({ error: 'Email, new password and reset token are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetPasswordToken, process.env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(400).json({ error: 'Invalid or expired reset token. Verify OTP again.' });
    }

    if (decoded.purpose !== 'forgot_password_otp_verified' || decoded.email !== email) {
      return res.status(400).json({ error: 'Reset token does not match this email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({ message: 'Password reset successful. Please login with new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};

const resetPasswordWithFirebaseOTP = async (req, res) => {
  try {
    const { oobCode, newPassword } = req.body;
    const firebaseApiKey = getFirebaseApiKey();

    if (!firebaseApiKey) {
      return res.status(500).json({ error: 'Firebase API key is not configured on server' });
    }

    if (!oobCode || !newPassword) {
      return res.status(400).json({ error: 'oobCode and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${firebaseApiKey}`;

    const verifyResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oobCode })
    });
    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.email) {
      return res.status(400).json({ error: 'Invalid or expired Firebase OTP code' });
    }

    const applyResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oobCode, newPassword })
    });
    const applyData = await applyResponse.json();

    if (!applyResponse.ok || applyData.error) {
      return res.status(400).json({ error: 'Failed to apply Firebase password reset' });
    }

    const user = await User.findOne({ email: verifyData.email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({ message: 'Password reset successful. Please login with new password.' });
  } catch (error) {
    console.error('Firebase reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password with Firebase OTP' });
  }
};

const signup = async (req, res) => {
  try {
    const { email, password, phoneNumber, semester, captchaToken, googleIdToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ error: 'Captcha verification required' });
    }

    if (!googleIdToken) {
      return res.status(400).json({ error: 'Google account verification is required' });
    }

    let googleProfile;
    try {
      googleProfile = await verifyGoogleIdTokenWithFirebase(googleIdToken);
    } catch (googleError) {
      return res.status(500).json({ error: 'Failed to verify Google account' });
    }

    if (!googleProfile || !googleProfile.emailVerified || !googleProfile.hasGoogleProvider) {
      return res.status(400).json({ error: 'Invalid Google verification token' });
    }

    if (googleProfile.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ error: 'Google account email does not match entered email' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      phoneNumber,
      semester
    });

    await user.save();

    const dashboard = new UserDashboard({
      userId: user._id,
      personalizedContent: {
        welcomeMessage: `Welcome to your AI Learning Journey, ${email.split('@')[0]}!`,
        learningGoals: [`Master ${semester} semester concepts`, 'Improve study efficiency', 'Achieve academic excellence'],
        achievements: [
          {
            title: 'Welcome Aboard!',
            description: 'Successfully created your AI Student Assistant account',
            icon: '🎉'
          }
        ]
      },
      quickActions: [
        { title: 'Start AI Chat', description: 'Begin intelligent conversations', icon: 'MessageCircle', route: '/chat' },
        { title: 'Upload Documents', description: 'Add your study materials', icon: 'FileText', route: '/documents' },
        { title: 'Generate Quiz', description: 'Create practice tests', icon: 'Brain', route: '/chat?type=quiz' },
        { title: 'Study Planner', description: 'Organize your learning', icon: 'Calendar', route: '/chat?type=plan' }
      ]
    });

    await dashboard.save();

    return res.status(201).json({
      message: 'Successfully registered! You can now login.',
      user: {
        id: user._id,
        email: user.email,
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    await ensureDashboardForUser(user);

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    return res.json({
      id: req.user._id,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber,
      semester: req.user.semester
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Failed to get user data' });
  }
};

module.exports = {
  sendSignupOTP,
  verifySignupOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
  resetPasswordWithFirebaseOTP,
  signup,
  login,
  getCurrentUser
};
