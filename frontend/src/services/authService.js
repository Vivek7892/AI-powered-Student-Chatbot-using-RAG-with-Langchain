import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updatePassword
} from 'firebase/auth';
import api from './api';
import { auth } from '../config/firebase';

export const authService = {
  async login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await credential.user.getIdToken();
    return {
      token,
      firebaseUser: credential.user
    };
  },

  async sendForgotPasswordLink(email) {
    await sendPasswordResetEmail(auth, email);
    return { message: 'Password reset email sent.' };
  },

  async resetPassword(resetCode, newPassword) {
    await confirmPasswordReset(auth, resetCode, newPassword);
    return { message: 'Password reset successful. Please sign in.' };
  },

  async changePassword(currentPassword, newPassword) {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('No signed-in user found.');
    }

    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
    return { message: 'Password updated successfully.' };
  },

  async signup(email, password) {
    await createUserWithEmailAndPassword(auth, email, password);
    await signOut(auth);
    return { message: 'Account created successfully' };
  },

  async googleSignIn() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();
    return {
      token,
      firebaseUser: result.user
    };
  },

  async githubSignIn() {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();
    return {
      token,
      firebaseUser: result.user
    };
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    await signOut(auth);
  }
};
