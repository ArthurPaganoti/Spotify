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
  // Criar nova playlist
  createPlaylist: async (data: CreatePlaylistRequest): Promise<PlaylistDTO> => {
    const response = await api.post<ResponseDTO<PlaylistDTO>>('/playlists', data);
    return response.data.content;
  },

  // Atualizar playlist
  updatePlaylist: async (playlistId: number, data: UpdatePlaylistRequest): Promise<PlaylistDTO> => {
    const response = await api.put<ResponseDTO<PlaylistDTO>>(`/playlists/${playlistId}`, data);
    return response.data.content;
  },

  // Deletar playlist
  deletePlaylist: async (playlistId: number): Promise<void> => {
    await api.delete(`/playlists/${playlistId}`);
  },

  // Listar minhas playlists
  getMyPlaylists: async (): Promise<PlaylistDTO[]> => {
    const response = await api.get<ResponseDTO<PlaylistDTO[]>>('/playlists/my-playlists');
    return response.data.content;
  },

  // Listar playlists públicas
  getPublicPlaylists: async (): Promise<PlaylistDTO[]> => {
    const response = await api.get<ResponseDTO<PlaylistDTO[]>>('/playlists/public');
    return response.data.content;
  },

  // Listar todas as playlists acessíveis
  getAllAccessiblePlaylists: async (): Promise<PlaylistDTO[]> => {
    const response = await api.get<ResponseDTO<PlaylistDTO[]>>('/playlists');
    return response.data.content;
  },

  // Buscar playlist por ID com suas músicas
  getPlaylistById: async (playlistId: number): Promise<PlaylistWithMusicsDTO> => {
    const response = await api.get<ResponseDTO<PlaylistWithMusicsDTO>>(`/playlists/${playlistId}`);
    return response.data.content;
  },

  // Adicionar música à playlist
  addMusicToPlaylist: async (playlistId: number, data: AddMusicToPlaylistRequest): Promise<void> => {
    await api.post(`/playlists/${playlistId}/musics`, data);
  },

  // Remover música da playlist
  removeMusicFromPlaylist: async (playlistId: number, musicId: string): Promise<void> => {
    await api.delete(`/playlists/${playlistId}/musics/${musicId}`);
  },
};

