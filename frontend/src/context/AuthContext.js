import React, { createContext, useContext, useState, useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { authService } from '../services/authService';
import { auth } from '../config/firebase';

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
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('token', token);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth sync error:', error);
        setUser({
          email: firebaseUser.email,
          id: firebaseUser.uid
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    await authService.login(email, password);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return { message: 'Login successful' };
  };

  const googleLogin = async () => {
    await authService.googleSignIn();
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return { message: 'Login successful' };
  };

  const githubLogin = async () => {
    await authService.githubSignIn();
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return { message: 'Login successful' };
  };

  const sendForgotPasswordLink = async (email) => {
    return await authService.sendForgotPasswordLink(email);
  };

  const resetPassword = async (resetCode, newPassword) => {
    return await authService.resetPassword(resetCode, newPassword);
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changePassword(currentPassword, newPassword);
  };

  const signup = async (email, password) => {
    return await authService.signup(email, password);
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    googleLogin,
    githubLogin,
    sendForgotPasswordLink,
    resetPassword,
    changePassword,
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
