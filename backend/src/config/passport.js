const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const UserDashboard = require('../models/UserDashboard');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (!user) {
      user = await User.create({
        email: profile.emails[0].value,
        password: Math.random().toString(36).slice(-8),
        phoneNumber: '',
        semester: '1st',
        oauthProvider: 'google',
        oauthId: profile.id
      });

      await UserDashboard.create({
        userId: user._id,
        personalizedContent: {
          welcomeMessage: `Welcome ${profile.displayName || profile.emails[0].value.split('@')[0]}!`,
          learningGoals: ['Master 1st semester concepts']
        }
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.local`;
    let user = await User.findOne({ $or: [{ email }, { oauthId: profile.id, oauthProvider: 'github' }] });
    
    if (!user) {
      user = await User.create({
        email,
        password: Math.random().toString(36).slice(-8),
        phoneNumber: '',
        semester: '1st',
        oauthProvider: 'github',
        oauthId: profile.id
      });

      await UserDashboard.create({
        userId: user._id,
        personalizedContent: {
          welcomeMessage: `Welcome ${profile.displayName || profile.username}!`,
          learningGoals: ['Master 1st semester concepts']
        }
      });
    }
    
    return done(null, user);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
}));

module.exports = passport;
