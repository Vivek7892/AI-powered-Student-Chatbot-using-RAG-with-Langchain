// API Configuration for production deployment
const API_CONFIG = {
  development: 'http://localhost:5002',
  production: 'https://ai-powered-student-chatbot-using-rag-ald2.onrender.com'
};

const rawApiUrl = process.env.REACT_APP_API_URL || '';
const trimmedApiUrl = rawApiUrl.replace(/\/+$/, '');
const normalizedApiBase = trimmedApiUrl.endsWith('/api')
  ? trimmedApiUrl.slice(0, -4)
  : trimmedApiUrl;

export const API_BASE_URL = normalizedApiBase || (
  process.env.NODE_ENV === 'production'
    ? API_CONFIG.production
    : API_CONFIG.development
);

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout'
  },
  chat: {
    session: '/api/chat/session',
    message: '/api/chat/message',
    history: '/api/chat/history'
  },
  documents: {
    upload: '/api/documents/upload',
    list: '/api/documents',
    delete: '/api/documents'
  }
};
