import api from './api';
import {
  ResponseDTO,
  PlaylistDTO,
  PlaylistWithMusicsDTO,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  AddMusicToPlaylistRequest,
} from '../types';

export const playlistService = {
  createPlaylist: async (data: CreatePlaylistRequest): Promise<PlaylistDTO> => {
    const response = await api.post<ResponseDTO<PlaylistDTO>>('/playlists', data);
    return response.data.content;
  },

  updatePlaylist: async (playlistId: number, data: UpdatePlaylistRequest): Promise<PlaylistDTO> => {
    const response = await api.put<ResponseDTO<PlaylistDTO>>(`/playlists/${playlistId}`, data);
    return response.data.content;
  },

  updatePlaylistImage: async (playlistId: number, imageFile: File): Promise<PlaylistDTO> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post<ResponseDTO<PlaylistDTO>>(
      `/playlists/${playlistId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.content;
  },

  deletePlaylist: async (playlistId: number): Promise<void> => {
    await api.delete(`/playlists/${playlistId}`);
  },

  getMyPlaylists: async (): Promise<PlaylistDTO[]> => {
    const response = await api.get<ResponseDTO<PlaylistDTO[]>>('/playlists/my-playlists');
    return response.data.content;
  },

  getPublicPlaylists: async (): Promise<PlaylistDTO[]> => {
    const response = await api.get<ResponseDTO<PlaylistDTO[]>>('/playlists/public');
    return response.data.content;
  },

  getAllAccessiblePlaylists: async (): Promise<PlaylistDTO[]> => {
    const response = await api.get<ResponseDTO<PlaylistDTO[]>>('/playlists');
    return response.data.content;
  },

  getPlaylistById: async (playlistId: number): Promise<PlaylistWithMusicsDTO> => {
    const response = await api.get<ResponseDTO<PlaylistWithMusicsDTO>>(`/playlists/${playlistId}`);
    return response.data.content;
  },

  addMusicToPlaylist: async (playlistId: number, data: AddMusicToPlaylistRequest): Promise<void> => {
    await api.post(`/playlists/${playlistId}/musics`, data);
  },

  removeMusicFromPlaylist: async (playlistId: number, musicId: string): Promise<void> => {
    await api.delete(`/playlists/${playlistId}/musics/${musicId}`);
  },
};
