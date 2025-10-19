import api from './api';
import { User, UserProfileUpdateDTO, ResponseDTO } from '../types';

export const profileService = {
  async getProfile(): Promise<User> {
    const response = await api.get<ResponseDTO<User>>('/users/profile');
    return response.data.content;
  },

  async updateProfile(data: UserProfileUpdateDTO): Promise<User> {
    const response = await api.put<ResponseDTO<User>>('/users/profile', data);
    return response.data.content;
  },

  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post<ResponseDTO<User>>('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.content;
  },

  async deleteAvatar(): Promise<void> {
    await api.delete('/users/profile/avatar');
  },
};

