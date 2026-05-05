import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Mail, Save, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import './Profile.css';

const Profile = () => {
  const { user, changePassword, sendForgotPasswordLink } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const profileName = useMemo(() => {
    const emailPrefix = user?.email?.split('@')[0] || 'student';
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }, [user]);

  const providerIds = auth.currentUser?.providerData?.map((provider) => provider.providerId) || [];
  const canChangePassword = providerIds.includes('password');

  const handleSave = () => {
    setSaving(true);
    setSavedMessage('');
    setTimeout(() => {
      setSaving(false);
      setSavedMessage('Preferences updated.');
    }, 600);
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage('Password updated successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(error?.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePasswordResetLink = async () => {
    setPasswordError('');
    setPasswordMessage('');

    try {
      await sendForgotPasswordLink(user?.email || '');
      setPasswordMessage('Password reset link sent to your email.');
    } catch (error) {
      setPasswordError(error?.message || 'Failed to send reset link.');
    }
  };

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero__avatar">
          {(user?.email || 'U').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1>{profileName}</h1>
          <p>Manage your profile and learning preferences</p>
        </div>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <h2>Account Details</h2>
          <div className="profile-detail">
            <User size={16} />
            <span>{profileName}</span>
          </div>
          <div className="profile-detail">
            <Mail size={16} />
            <span>{user?.email || 'No email'}</span>
          </div>
          <div className="profile-detail">
            <CalendarDays size={16} />
            <span>{user?.semester || 'Semester not set'}</span>
          </div>
          <div className="profile-detail">
            <ShieldCheck size={16} />
            <span>Secure account enabled</span>
          </div>
        </article>

        <article className="profile-card">
          <h2>Notifications</h2>
          <label className="profile-toggle">
            <div>
              <strong>Email notifications</strong>
              <small>Receive updates for tests and notes</small>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
            />
          </label>
          <label className="profile-toggle">
            <div>
              <strong>Weekly summary</strong>
              <small>Get progress digest every week</small>
            </div>
            <input
              type="checkbox"
              checked={weeklySummary}
              onChange={(event) => setWeeklySummary(event.target.checked)}
            />
          </label>
          <button type="button" onClick={handleSave} className="profile-save-btn" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save preferences'}</span>
          </button>
          {savedMessage ? <p className="profile-success">{savedMessage}</p> : null}
        </article>

        <article className="profile-card">
          <h2>Password</h2>
          {canChangePassword ? (
            <form className="profile-password-form" onSubmit={handlePasswordChange}>
              <label className="profile-field">
                <span>Current password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="profile-field">
                <span>New password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="profile-field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                  required
                />
              </label>
              <button type="submit" className="profile-save-btn" disabled={passwordSaving}>
                <ShieldCheck size={16} />
                <span>{passwordSaving ? 'Updating...' : 'Change password'}</span>
              </button>
            </form>
          ) : (
            <div className="profile-password-note">
              <p>This account uses Google or GitHub sign-in, so there is no local password to change here.</p>
              <button type="button" className="profile-link-btn" onClick={handlePasswordResetLink}>
                Send password reset link
              </button>
            </div>
          )}
          {passwordError ? <p className="profile-error">{passwordError}</p> : null}
          {passwordMessage ? <p className="profile-success">{passwordMessage}</p> : null}
        </article>

        <article className="profile-card profile-card--wide">
          <h2>Quick Links</h2>
          <div className="profile-links">
            <Link to="/">Back to Dashboard</Link>
            <Link to="/documents">My Documents</Link>
            <Link to="/study-planner">Study Planner</Link>
            <Link to="/chat">AI Chat</Link>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Profile;
