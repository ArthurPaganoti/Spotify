import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, Check, X, Music } from 'lucide-react';
import { CollaboratorInviteDTO } from '../types';
import { collaboratorService } from '../services/collaboratorService';
import toast from 'react-hot-toast';

const CollaboratorInvites: React.FC = () => {
  const [invites, setInvites] = useState<CollaboratorInviteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const response = await collaboratorService.getMyInvites();
      setInvites(response.content);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      toast.error('Erro ao carregar convites');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId: number) => {
    try {
      setProcessingId(inviteId);
      const response = await collaboratorService.acceptInvite(inviteId);
      toast.success(response.message || 'Convite aceito com sucesso!');
      await loadInvites();
      queryClient.invalidateQueries({ queryKey: ['collaboratorInvites'] });
      queryClient.invalidateQueries({ queryKey: ['myPlaylists'] });
      queryClient.invalidateQueries({ queryKey: ['accessiblePlaylists'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao aceitar convite');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (inviteId: number) => {
    try {
      setProcessingId(inviteId);
      const response = await collaboratorService.rejectInvite(inviteId);
      toast.success(response.message || 'Convite rejeitado');
      await loadInvites();
      queryClient.invalidateQueries({ queryKey: ['collaboratorInvites'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao rejeitar convite');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto text-gray-600 mb-4" size={48} />
        <p className="text-gray-400 text-lg">Você não tem convites pendentes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Mail className="text-green-500" size={28} />
        Convites de Colaboração
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 transition"
          >
            <div className="flex items-start gap-4 mb-4">
              {invite.playlistImageUrl ? (
                <img
                  src={invite.playlistImageUrl}
                  alt={invite.playlistName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center">
                  <Music className="text-gray-500" size={32} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate mb-1">
                  {invite.playlistName}
                </h3>
                <p className="text-sm text-gray-400">
                  Convidado por <span className="text-green-500">{invite.invitedByUserName}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(invite.invitedAt)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(invite.id)}
                disabled={processingId === invite.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} />
                Aceitar
              </button>
              <button
                onClick={() => handleReject(invite.id)}
                disabled={processingId === invite.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaboratorInvites;
