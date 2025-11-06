import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        navigate('/admin/dashboard');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-background">
        <div className="admin-login-shape"></div>
        <div className="admin-login-shape"></div>
      </div>
      
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <div className="admin-login-icon">⚡</div>
            <h1>Admin Portal</h1>
          </div>
          <p>Secure access to management dashboard</p>
          <div className="admin-demo-credentials">
            <p>📧 admin@example.com</p>
            <p>🔑 admin123</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-input-group">
            <div className="admin-input-wrapper">
              <input
                type="email"
                placeholder="Email address"
                className="admin-input"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
              />
              <span className="admin-input-icon">📧</span>
            </div>
          </div>

          <div className="admin-input-group">
            <div className="admin-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="admin-input"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-login-btn"
          >
            {loading ? (
              <>
                <div className="admin-spinner"></div>
                Authenticating...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
