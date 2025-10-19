import api from './api';
import { 
  CollaboratorDTO, 
  CollaboratorInviteDTO, 
  InviteCollaboratorRequest,
  ResponseDTO 
} from '../types';

export const collaboratorService = {
  inviteCollaborator: async (playlistId: number, request: InviteCollaboratorRequest) => {
    const response = await api.post<ResponseDTO<CollaboratorDTO>>(
      `/playlists/${playlistId}/collaborators`,
      request
    );
    return response.data;
  },

  getPlaylistCollaborators: async (playlistId: number) => {
    const response = await api.get<ResponseDTO<CollaboratorDTO[]>>(
      `/playlists/${playlistId}/collaborators`
    );
    return response.data;
  },

  removeCollaborator: async (playlistId: number, collaboratorId: number) => {
    const response = await api.delete<ResponseDTO<void>>(
      `/playlists/${playlistId}/collaborators/${collaboratorId}`
    );
    return response.data;
  },

  getMyInvites: async () => {
    const response = await api.get<ResponseDTO<CollaboratorInviteDTO[]>>(
      '/playlists/collaborator-invites'
    );
    return response.data;
  },

  acceptInvite: async (inviteId: number) => {
    const response = await api.post<ResponseDTO<CollaboratorDTO>>(
      `/playlists/collaborator-invites/${inviteId}/accept`
    );
    return response.data;
  },

  rejectInvite: async (inviteId: number) => {
    const response = await api.post<ResponseDTO<CollaboratorDTO>>(
      `/playlists/collaborator-invites/${inviteId}/reject`
    );
    return response.data;
  },
};

