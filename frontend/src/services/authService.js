import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async sendForgotPasswordLink(email) {
    const response = await api.post('/auth/forgot-password/send-link', { email });
    return response.data;
  },

  async resetPassword(email, newPassword, resetPasswordToken) {
    const response = await api.post('/auth/forgot-password/reset', { email, newPassword, resetPasswordToken });
    return response.data;
  },

  async signup(email, password) {
    const response = await api.post('/auth/signup', {
      email,
      password
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
