import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const sendSignupOtp = async (email) => {
    return await authService.sendSignupOtp(email);
  };

  const verifySignupOtp = async (email, otp) => {
    return await authService.verifySignupOtp(email, otp);
  };

  const sendForgotPasswordOtp = async (email) => {
    return await authService.sendForgotPasswordOtp(email);
  };

  const verifyForgotPasswordOtp = async (email, otp) => {
    return await authService.verifyForgotPasswordOtp(email, otp);
  };

  const resetPassword = async (email, newPassword, resetPasswordToken) => {
    return await authService.resetPassword(email, newPassword, resetPasswordToken);
  };

  const resetPasswordWithFirebaseOtp = async (oobCode, newPassword) => {
    return await authService.resetPasswordWithFirebaseOtp(oobCode, newPassword);
  };

  const signup = async (email, password, phoneNumber, semester, captchaToken, googleIdToken) => {
    return await authService.signup(email, password, phoneNumber, semester, captchaToken, googleIdToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    sendSignupOtp,
    verifySignupOtp,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword,
    resetPasswordWithFirebaseOtp,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
