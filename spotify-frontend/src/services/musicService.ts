import api from './api';
import { MusicRequestDTO, MusicResponseDTO, ResponseDTO } from '../types';

export const musicService = {
  async getAllMusics(): Promise<MusicResponseDTO[]> {
    try {
      const response = await api.get<ResponseDTO<MusicResponseDTO[]>>('/musics');
      return response.data?.content || [];
    } catch (error: any) {
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

  async addMusic(musicData: MusicRequestDTO): Promise<MusicResponseDTO> {
    try {
      const response = await api.post<ResponseDTO<MusicResponseDTO>>('/musics', musicData);
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
};
