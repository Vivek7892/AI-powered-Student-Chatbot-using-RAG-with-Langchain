import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async sendSignupOtp(email) {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  async verifySignupOtp(email, otp) {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  async sendForgotPasswordOtp(email) {
    const response = await api.post('/auth/forgot-password/send-otp', { email });
    return response.data;
  },

  async verifyForgotPasswordOtp(email, otp) {
    const response = await api.post('/auth/forgot-password/verify-otp', { email, otp });
    return response.data;
  },

  async resetPassword(email, newPassword, resetPasswordToken) {
    const response = await api.post('/auth/forgot-password/reset', { email, newPassword, resetPasswordToken });
    return response.data;
  },

  async resetPasswordWithFirebaseOtp(oobCode, newPassword) {
    const response = await api.post('/auth/forgot-password/firebase-reset', { oobCode, newPassword });
    return response.data;
  },

  async signup(email, password, phoneNumber, semester, captchaToken, googleIdToken) {
    const response = await api.post('/auth/signup', {
      email,
      password,
      phoneNumber,
      semester,
      captchaToken,
      googleIdToken
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
