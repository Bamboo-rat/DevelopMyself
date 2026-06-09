import axiosClient from '../config/axiosClient';

export const userService = {
  getProfile: () => {
    return axiosClient.get('/users/me');
  },

  updateProfile: (data: { fullName?: string; avatarUrl?: string }) => {
    return axiosClient.put('/users/me', data);
  },

  changePassword: (data: any) => {
    return axiosClient.put('/users/me/password', data);
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
