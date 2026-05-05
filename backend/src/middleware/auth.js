const User = require('../models/User');
const UserDashboard = require('../models/UserDashboard');
const { admin, isFirebaseAdminReady } = require('../config/firebaseAdmin');

const ensureDashboardForUser = async (user) => {
  const existingDashboard = await UserDashboard.findOne({ userId: user._id });
  if (existingDashboard) {
    return;
  }

  await UserDashboard.create({
    userId: user._id,
    personalizedContent: {
      welcomeMessage: `Welcome back, ${String(user.email || 'student').split('@')[0]}!`,
      learningGoals: [`Master ${user.semester} semester concepts`]
    }
  });
};

const auth = async (req, res, next) => {
  try {
    if (!isFirebaseAdminReady) {
      return res.status(503).json({
        error: 'Firebase Admin is not configured on server.'
      });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const email = String(decoded.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(401).json({ error: 'Invalid token: email is missing.' });
    }

    let user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email }]
    });

    if (!user) {
      user = await User.create({
        email,
        firebaseUid: decoded.uid,
        phoneNumber: '',
        semester: 'Semester 1'
      });
    } else {
      let hasChanges = false;
      if (user.email !== email) {
        user.email = email;
        hasChanges = true;
      }
      if (!user.firebaseUid) {
        user.firebaseUid = decoded.uid;
        hasChanges = true;
      }
      if (hasChanges) {
        await user.save();
      }
    }

    await ensureDashboardForUser(user);
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
