import axiosClient from '~/config/axiosClient';

export const authService = {
  login: (data: any) => {
    return axiosClient.post('/auth/login', data);
  },

  register: (data: any) => {
    return axiosClient.post('/auth/register', data);
  },

  // (Ví dụ) Nếu sau này cần lấy profile
  getProfile: () => {
    return axiosClient.get('/users/profile');
  }
};
