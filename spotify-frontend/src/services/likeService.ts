import api from './api';
import { MusicResponseDTO, ResponseDTO } from '../types';

export const likeService = {
  async toggleLike(musicId: string): Promise<void> {
    await api.post(`/likes/${musicId}`);
  },

  async isLiked(musicId: string): Promise<boolean> {
    const response = await api.get<ResponseDTO<boolean>>(`/likes/${musicId}/check`);
    return response.data.content;
  },

  async getLikedMusics(): Promise<MusicResponseDTO[]> {
    const response = await api.get<ResponseDTO<MusicResponseDTO[]>>('/likes');
    return response.data.content;
  },
};

