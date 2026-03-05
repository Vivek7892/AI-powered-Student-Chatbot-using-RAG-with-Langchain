import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import './Login.css';

const MODES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT: 'forgot'
};

const Login = () => {
  const { login, signup, sendForgotPasswordLink, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    confirmPassword: ''
  });
  const [forgotForm, setForgotForm] = useState({
    email: '',
    resetPasswordToken: '',
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
    const email = params.get('email');
    const resetPasswordToken = params.get('resetPasswordToken');
    const errorCode = params.get('error');

    if (modeFromUrl === MODES.LOGIN || modeFromUrl === MODES.SIGNUP || modeFromUrl === MODES.FORGOT) {
      setMode(modeFromUrl);
    }

    if (modeFromUrl === MODES.FORGOT) {
      if (email || resetPasswordToken) {
        setForgotForm((current) => ({
          ...current,
          email: email || current.email,
          resetPasswordToken: resetPasswordToken || current.resetPasswordToken
        }));
      }
      if (resetPasswordToken) {
        setInfo('Reset link verified. Enter your new password.');
      }
      if (errorCode === 'google_email_mismatch') {
        setError('Google account email does not match the entered email.');
      }
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

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    resetMessages();

    const email = signupForm.email.trim();
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(email, signupForm.password);
      setInfo('Account created successfully. Please sign in.');
      setLoginForm((current) => ({ ...current, email }));
      setMode(MODES.LOGIN);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    resetMessages();
    if (!forgotForm.email) {
      setError('Enter your email first.');
      return;
    }

    setLoading(true);
    try {
      await sendForgotPasswordLink(forgotForm.email.trim());
      setInfo('Reset link sent to your email. Open the link to create a new password.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    resetMessages();

    if (!forgotForm.resetPasswordToken) {
      setError('Open reset link from your email first.');
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(
        forgotForm.email.trim(),
        forgotForm.newPassword,
        forgotForm.resetPasswordToken
      );
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
                    ? 'Create your student account.'
                    : 'Send password reset link to your email.'}
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
                    onClick={() => window.location.href = `${API_BASE_URL}/api/auth/google?frontend=${encodeURIComponent(window.location.origin)}`}
                    disabled={loading}
                  >
                    <span className="login-btn__content">Continue with Google</span>
                  </button>
                  <button
                    type="button"
                    className="login-btn login-btn--secondary"
                    onClick={() => window.location.href = `${API_BASE_URL}/api/auth/github?frontend=${encodeURIComponent(window.location.origin)}`}
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
              <form className="login-form" onSubmit={forgotForm.resetPasswordToken ? handleResetPassword : (e) => { e.preventDefault(); handleSendResetLink(); }}>
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
                {!forgotForm.resetPasswordToken ? (
                  <button
                    type="submit"
                    className="login-btn login-btn--ghost"
                    disabled={loading}
                  >
                    Send Reset Link
                  </button>
                ) : null}
                {forgotForm.resetPasswordToken ? (
                  <>
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
                      <span className="login-btn__content">{loading ? 'Resetting password...' : 'Create New Password'}</span>
                    </button>
                  </>
                ) : null}
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
