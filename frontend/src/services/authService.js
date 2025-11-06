import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async signup(email, password, phoneNumber, semester, captchaToken) {
    const response = await api.post('/auth/signup', { email, password, phoneNumber, semester, captchaToken });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
