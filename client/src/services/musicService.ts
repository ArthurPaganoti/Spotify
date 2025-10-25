import api from './api';
import { MusicRequestDTO, MusicResponseDTO, ResponseDTO, PageResponse } from '../types';

export const musicService = {
  async getAllMusics(page: number = 0, size: number = 50): Promise<PageResponse<MusicResponseDTO>> {
    try {
      const response = await api.get<ResponseDTO<PageResponse<MusicResponseDTO>>>('/musics', {
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
    } catch (error: any) {
      console.error('Erro ao buscar músicas:', error);
      throw error;
    }
  },

  async getMusicById(id: string): Promise<MusicResponseDTO> {
    try {
      const response = await api.get<ResponseDTO<MusicResponseDTO>>(`/musics/${id}`);
      return response.data?.content as MusicResponseDTO;
    } catch (error: any) {
      throw error;
    }
  },

  async addMusic(musicData: MusicRequestDTO, image?: File): Promise<MusicResponseDTO> {
    try {
      const formData = new FormData();
      formData.append('name', musicData.name);
      formData.append('genre', musicData.genre);
      formData.append('band', musicData.band);

      if (image) {
        formData.append('image', image);
      }

      const response = await api.post<ResponseDTO<MusicResponseDTO>>('/musics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.content as MusicResponseDTO;
    } catch (error: any) {
      throw error;
    }
  },

  async deleteMusic(id: string): Promise<void> {
    try {
      await api.delete(`/musics/${id}`);
    } catch (error: any) {
      throw error;
    }
  },

  async updateMusic(id: string, musicData: MusicRequestDTO, image?: File): Promise<MusicResponseDTO> {
    try {
      const formData = new FormData();
      formData.append('name', musicData.name);
      formData.append('genre', musicData.genre);
      formData.append('band', musicData.band);

      if (image) {
        formData.append('image', image);
      }

      const response = await api.put<ResponseDTO<MusicResponseDTO>>(`/musics/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.content as MusicResponseDTO;
    } catch (error: any) {
      throw error;
    }
  },

  async addMusicByLyrics(lyrics: string, genre: string): Promise<MusicResponseDTO> {
    try {
      const formData = new FormData();
      formData.append('lyrics', lyrics);
      formData.append('genre', genre);

      const response = await api.post<ResponseDTO<MusicResponseDTO>>('/musics/search-by-lyrics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.content as MusicResponseDTO;
    } catch (error: any) {
      throw error;
    }
  },

  async searchLyricsOptions(lyrics: string): Promise<any[]> {
    try {
      const formData = new FormData();
      formData.append('lyrics', lyrics);

      const response = await api.post<ResponseDTO<any[]>>('/musics/search-lyrics-options', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data?.content || [];
    } catch (error: any) {
      throw error;
    }
  },

  async addSelectedMusic(videoId: string, thumbnailUrl: string, musicName: string, bandName: string, genre: string): Promise<MusicResponseDTO> {
    try {
      const formData = new FormData();
      formData.append('videoId', videoId);
      formData.append('thumbnailUrl', thumbnailUrl);
      formData.append('musicName', musicName);
      formData.append('bandName', bandName);
      if (genre) {
        formData.append('genre', genre);
      }

      const response = await api.post<ResponseDTO<MusicResponseDTO>>('/musics/add-selected-music', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.content as MusicResponseDTO;
    } catch (error: any) {
      throw error;
    }
  },
};
