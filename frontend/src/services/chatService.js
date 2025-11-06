import api from './api';

export const chatService = {
  async createSession(userId, documentId = null) {
    const response = await api.post('/chat/session', { userId, documentId });
    return response.data;
  },

  async sendMessage(data) {
    const response = await api.post('/chat/message', data);
    return response.data;
  },

  async getChatHistory(userId) {
    const response = await api.get(`/chat/history/${userId}`);
    return response.data;
  },

  async getSession(sessionId) {
    const response = await api.get(`/chat/session/${sessionId}`);
    return response.data;
  }
};
