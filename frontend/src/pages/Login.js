import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import {
  isFirebaseConfigured,
  sendForgotPasswordFirebaseEmail,
  signInWithGoogleForVerification
} from '../services/firebaseAuth';
import './Login.css';

const MODES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT: 'forgot'
};

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8'
];

const Login = () => {
  const { login, signup, resetPasswordWithFirebaseOtp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const firebaseEnabled = isFirebaseConfigured();

  const [mode, setMode] = useState(MODES.LOGIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    semester: SEMESTERS[0],
    googleIdToken: '',
    verifiedGoogleEmail: ''
  });
  const [forgotForm, setForgotForm] = useState({
    email: '',
    oobCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeFromUrl = params.get('mode');
    const oobCode = params.get('oobCode');

    if (modeFromUrl === MODES.LOGIN || modeFromUrl === MODES.SIGNUP || modeFromUrl === MODES.FORGOT) {
      setMode(modeFromUrl);
    }

    if (oobCode) {
      setMode(MODES.FORGOT);
      setForgotForm((current) => ({ ...current, oobCode }));
      setInfo('Password reset code detected. Set your new password.');
    }
  }, [location.search]);

  const resetMessages = () => {
    setError('');
    setInfo('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    resetMessages();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await login(loginForm.email.trim(), loginForm.password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleVerifyForSignup = async () => {
    resetMessages();
    if (!firebaseEnabled) {
      setError('Firebase is not configured for Google verification.');
      return;
    }
    if (!signupForm.email) {
      setError('Enter your email before Google verification.');
      return;
    }

    setLoading(true);
    try {
      const verified = await signInWithGoogleForVerification();
      const typedEmail = signupForm.email.trim().toLowerCase();
      const googleEmail = (verified.email || '').trim().toLowerCase();

      if (!googleEmail) {
        setError('Unable to read Google account email.');
      } else if (typedEmail !== googleEmail) {
        setError(`Google account email (${googleEmail}) does not match entered email.`);
      } else {
        setSignupForm((current) => ({
          ...current,
          googleIdToken: verified.idToken,
          verifiedGoogleEmail: verified.email
        }));
        setInfo(`Google account verified: ${verified.email}`);
      }
    } catch (err) {
      setError(err?.message || 'Google verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    resetMessages();

    const email = signupForm.email.trim();
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }
    if (!signupForm.googleIdToken) {
      setError('Verify your email with Google before creating account.');
      return;
    }
    if (email.toLowerCase() !== signupForm.verifiedGoogleEmail.trim().toLowerCase()) {
      setError('Entered email does not match verified Google account.');
      return;
    }

    setLoading(true);
    try {
      await signup(
        email,
        signupForm.password,
        signupForm.phoneNumber.trim(),
        signupForm.semester,
        'captcha-placeholder-token',
        signupForm.googleIdToken
      );
      setInfo('Account created successfully. Please sign in.');
      setLoginForm((current) => ({ ...current, email }));
      setMode(MODES.LOGIN);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotEmail = async () => {
    resetMessages();
    if (!firebaseEnabled) {
      setError('Firebase is not configured for forgot password.');
      return;
    }
    if (!forgotForm.email) {
      setError('Enter your email first.');
      return;
    }

    setLoading(true);
    try {
      await sendForgotPasswordFirebaseEmail(forgotForm.email.trim());
      setInfo('Password reset email sent. Open link and paste `oobCode` here.');
    } catch (err) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    resetMessages();

    if (!forgotForm.oobCode) {
      setError('Enter the password reset code (oobCode).');
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithFirebaseOtp(forgotForm.oobCode.trim(), forgotForm.newPassword);
      setInfo('Password reset successful. Please sign in.');
      setLoginForm((current) => ({ ...current, email: forgotForm.email.trim() }));
      setMode(MODES.LOGIN);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-layout">
        <section className="login-illustration" aria-hidden="true">
          <div className="login-illustration__orb">AI</div>
          <h1 className="login-illustration__title">Welcome back</h1>
          <p className="login-illustration__subtitle">
            Continue your study flow with AI chat, planners, notes, and tests in one dashboard.
          </p>
          <ul className="login-illustration__list">
            <li className="login-illustration__list-item">
              <span className="login-illustration__bullet" />
              <div>
                <h3>Instant access</h3>
                <p>Pick up exactly where you left off.</p>
              </div>
            </li>
            <li className="login-illustration__list-item">
              <span className="login-illustration__bullet login-illustration__bullet--purple" />
              <div>
                <h3>Smart planning</h3>
                <p>Generate a study schedule from your own goals.</p>
              </div>
            </li>
            <li className="login-illustration__list-item">
              <span className="login-illustration__bullet login-illustration__bullet--green" />
              <div>
                <h3>Better revision</h3>
                <p>Turn content into quizzes and practice tests quickly.</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="login-form-wrapper">
          <article className="login-card">
            <div className="login-card__logo" aria-hidden="true">A</div>
            <header className="login-card__head">
              <h2 className="login-heading">
                {mode === MODES.LOGIN ? 'Sign in' : mode === MODES.SIGNUP ? 'Create account' : 'Forgot password'}
              </h2>
              <p className="login-subheading">
                {mode === MODES.LOGIN
                  ? 'Use your account to open the student dashboard.'
                  : mode === MODES.SIGNUP
                    ? 'Verify email with Google account and create your student account.'
                    : 'Reset password with Firebase email verification.'}
              </p>
            </header>

            {mode === MODES.LOGIN ? (
              <form className="login-form" onSubmit={handleLogin}>
                <div className="login-form-group">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className="login-input"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <div className="login-form-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="login-password-wrap">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="login-input login-input--password"
                      value={loginForm.password}
                      onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                      required
                    />
                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="login-btn login-btn--primary" disabled={loading}>
                  <span className="login-btn__content">{loading ? 'Signing in...' : 'Sign in'}</span>
                </button>

                <div className="login-divider">Or continue with</div>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <button
                    type="button"
                    className="login-btn login-btn--secondary"
                    onClick={() => window.location.href = `${API_BASE_URL}/api/auth/google`}
                    disabled={loading}
                  >
                    <span className="login-btn__content">Continue with Google</span>
                  </button>
                  <button
                    type="button"
                    className="login-btn login-btn--secondary"
                    onClick={() => window.location.href = `${API_BASE_URL}/api/auth/github`}
                    disabled={loading}
                  >
                    <span className="login-btn__content">Continue with GitHub</span>
                  </button>
                </div>
              </form>
            ) : null}

            {mode === MODES.SIGNUP ? (
              <form className="login-form" onSubmit={handleCreateAccount}>
                <div className="login-form-group">
                  <label htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    className="login-input"
                    value={signupForm.email}
                    onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="login-btn login-btn--secondary"
                  onClick={handleGoogleVerifyForSignup}
                  disabled={loading}
                >
                  Verify with Google
                </button>
                <div className="login-form-group">
                  <label htmlFor="signup-phone">Phone Number</label>
                  <input
                    id="signup-phone"
                    type="tel"
                    className="login-input"
                    value={signupForm.phoneNumber}
                    onChange={(event) => setSignupForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                    required
                  />
                </div>
                <div className="login-form-group">
                  <label htmlFor="signup-semester">Semester</label>
                  <select
                    id="signup-semester"
                    className="login-input"
                    value={signupForm.semester}
                    onChange={(event) => setSignupForm((current) => ({ ...current, semester: event.target.value }))}
                  >
                    {SEMESTERS.map((semesterOption) => (
                      <option key={semesterOption} value={semesterOption}>
                        {semesterOption}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="login-form-group">
                  <label htmlFor="signup-password">Password</label>
                  <div className="login-password-wrap">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      className="login-input login-input--password"
                      value={signupForm.password}
                      onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                      required
                    />
                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="login-form-group">
                  <label htmlFor="signup-confirm-password">Confirm Password</label>
                  <div className="login-password-wrap">
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="login-input login-input--password"
                      value={signupForm.confirmPassword}
                      onChange={(event) => setSignupForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      required
                    />
                    <button type="button" className="login-password-toggle" onClick={() => setShowConfirmPassword((v) => !v)}>
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="login-btn login-btn--primary" disabled={loading}>
                  <span className="login-btn__content">{loading ? 'Creating account...' : 'Create Account'}</span>
                </button>
              </form>
            ) : null}

            {mode === MODES.FORGOT ? (
              <form className="login-form" onSubmit={handleResetPassword}>
                <div className="login-form-group">
                  <label htmlFor="forgot-email">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="login-input"
                    value={forgotForm.email}
                    onChange={(event) => setForgotForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="login-btn login-btn--ghost"
                  onClick={handleSendForgotEmail}
                  disabled={loading}
                >
                  Send Password Reset Email
                </button>
                <div className="login-form-group">
                  <label htmlFor="forgot-code">Reset Code (oobCode)</label>
                  <input
                    id="forgot-code"
                    type="text"
                    className="login-input"
                    value={forgotForm.oobCode}
                    onChange={(event) => setForgotForm((current) => ({ ...current, oobCode: event.target.value }))}
                    required
                  />
                </div>
                <div className="login-form-group">
                  <label htmlFor="forgot-new-password">New Password</label>
                  <input
                    id="forgot-new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    value={forgotForm.newPassword}
                    onChange={(event) => setForgotForm((current) => ({ ...current, newPassword: event.target.value }))}
                    required
                  />
                </div>
                <div className="login-form-group">
                  <label htmlFor="forgot-confirm-password">Confirm New Password</label>
                  <input
                    id="forgot-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="login-input"
                    value={forgotForm.confirmPassword}
                    onChange={(event) => setForgotForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="login-btn login-btn--primary" disabled={loading}>
                  <span className="login-btn__content">{loading ? 'Resetting password...' : 'Reset Password'}</span>
                </button>
              </form>
            ) : null}

            {error ? (
              <div className="login-error" role="alert">
                <span className="login-error__icon">!</span>
                <span>{error}</span>
              </div>
            ) : null}
            {info ? <div className="login-info">{info}</div> : null}

            <div className="login-divider">Account options</div>
            <div className="login-switch">
              {mode !== MODES.LOGIN ? (
                <button type="button" className="login-switch__action" onClick={() => switchMode(MODES.LOGIN)}>
                  Back to Sign in
                </button>
              ) : null}
              {mode !== MODES.SIGNUP ? (
                <button type="button" className="login-switch__action" onClick={() => switchMode(MODES.SIGNUP)}>
                  Create Account
                </button>
              ) : null}
              {mode !== MODES.FORGOT ? (
                <button type="button" className="login-switch__action" onClick={() => switchMode(MODES.FORGOT)}>
                  Forgot Password
                </button>
              ) : null}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
};

export default Login;
