import axios from 'axios';
import { signOut } from 'firebase/auth';
import { API_BASE_URL } from '../config/api';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: API_BASE_URL + '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const applyToken = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('token', token);
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  return applyToken();
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error('Firebase sign out failed:', signOutError);
        }
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
