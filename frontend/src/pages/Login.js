import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [semester, setSemester] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        if (!captchaToken) {
          setError('Please complete the captcha verification');
          setLoading(false);
          return;
        }
        await signup(email, password, phoneNumber, semester, captchaToken);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsLogin(true);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="login-page">
        <div className="login-card login-card--confirmation">
          <div className="login-card__logo login-card__logo--confirmation">✓</div>
          <div className="login-card__head">
            <h2 className="login-heading">Successfully Registered!</h2>
            <p className="login-subheading">Your account has been created successfully.</p>
            <span className="login-email">Redirecting to login...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-layout">
        <div className="login-illustration">
          <div className="login-illustration__orb" aria-hidden="true">🤖</div>
          <h1 className="login-illustration__title">AI Student Assistant</h1>
          <p className="login-illustration__subtitle">
            Your intelligent learning companion powered by advanced AI technology.
          </p>
          <ul className="login-illustration__list">
            <li className="login-illustration__list-item">
              <span className="login-illustration__bullet"></span>
              <div>
                <h3>Smart document analysis and Q&amp;A</h3>
                <p>Upload study materials and get contextual answers within seconds.</p>
              </div>
            </li>
            <li className="login-illustration__list-item">
              <span className="login-illustration__bullet login-illustration__bullet--purple"></span>
              <div>
                <h3>Personalized learning plans</h3>
                <p>Stay on track with adaptive study paths tailored to your goals.</p>
              </div>
            </li>
            <li className="login-illustration__list-item">
              <span className="login-illustration__bullet login-illustration__bullet--green"></span>
              <div>
                <h3>Interactive quiz generation</h3>
                <p>Generate quizzes instantly to reinforce your understanding.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="login-form-wrapper">
          <div className="login-card">
            <div className="login-card__logo" aria-hidden="true">🤖</div>
            <div className="login-card__head">
              <h2 className="login-heading">{isLogin ? 'Welcome Back!' : 'Join Us Today'}</h2>
              <p className="login-subheading">
                {isLogin
                  ? 'Sign in to continue your AI-powered learning journey.'
                  : 'Create your account and start learning smarter with AI.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="login-input"
                  required
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="login-input"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div className="login-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="login-input"
                      required
                    />
                  </div>
                  <div className="login-form-group">
                    <label htmlFor="semester">Semester</label>
                    <select
                      id="semester"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="login-input"
                      required
                    >
                      <option value="">Select your semester</option>
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </select>
                  </div>
                  <div className="login-form-group">
                    <ReCAPTCHA
                      sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      onChange={setCaptchaToken}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="login-error" role="alert">
                  <span className="login-error__icon">!</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="login-btn login-btn--primary"
              >
                {loading ? (
                  <span className="login-btn__content">
                    <span className="login-spinner" aria-hidden="true"></span>
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </span>
                ) : (
                  isLogin ? 'Sign In to Continue' : 'Create My Account'
                )}
              </button>
            </form>

            <div className="login-switch">
              <p>{isLogin ? "Don't have an account?" : 'Already have an account?'}</p>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="login-switch__action"
              >
                {isLogin ? 'Create New Account' : 'Sign In Instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
