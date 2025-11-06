import api from './api';

export const userService = {
  async getSemesterContent() {
    const response = await api.get('/user/content');
    return response.data;
  }
};
