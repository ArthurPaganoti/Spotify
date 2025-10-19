import api from './api';
import { MusicResponseDTO, ResponseDTO, PageResponse } from '../types';

export const likeService = {
  async toggleLike(musicId: string): Promise<void> {
    await api.post(`/likes/${musicId}`);
  },

  async isLiked(musicId: string): Promise<boolean> {
    const response = await api.get<ResponseDTO<boolean>>(`/likes/${musicId}/check`);
    return response.data.content;
  },

  async getLikedMusics(page: number = 0, size: number = 50): Promise<PageResponse<MusicResponseDTO>> {
    const response = await api.get<ResponseDTO<PageResponse<MusicResponseDTO>>>('/likes', {
      params: { page, size }
    });
    return response.data?.content || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 0,
      number: 0,
      first: true,
      last: true,
      empty: true
    };
  },
};
