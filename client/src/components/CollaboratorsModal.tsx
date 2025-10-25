import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Users } from 'lucide-react';
import { CollaboratorDTO, InviteCollaboratorRequest } from '../types';
import { collaboratorService } from '../services/collaboratorService';
import toast from 'react-hot-toast';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: number;
  playlistName: string;
  isOwner: boolean;
}

const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  isOpen,
  onClose,
  playlistId,
  playlistName,
  isOwner,
}) => {
  const [collaborators, setCollaborators] = useState<CollaboratorDTO[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (isOpen && isOwner) {
      loadCollaborators();
    }
  }, [isOpen, playlistId]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const response = await collaboratorService.getPlaylistCollaborators(playlistId);
      setCollaborators(response.content);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Digite um email válido');
      return;
    }

    try {
      setInviting(true);
      const request: InviteCollaboratorRequest = { email: email.trim() };
      const response = await collaboratorService.inviteCollaborator(playlistId, request);
      toast.success(response.message || 'Convite enviado com sucesso!');
      setEmail('');
      loadCollaborators();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao enviar convite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: number, userName: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Remover {userName} como colaborador?</p>
        <p className="text-sm text-gray-300">Esta ação não pode ser desfeita.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const response = await collaboratorService.removeCollaborator(playlistId, collaboratorId);
                toast.success(response.message || 'Colaborador removido com sucesso!');
                loadCollaborators();
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'Erro ao remover colaborador');
              }
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
          >
            Sim, remover
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #333',
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Users className="text-green-500" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Colaboradores</h2>
              <p className="text-sm text-gray-400">{playlistName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isOwner && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <UserPlus size={20} />
                Convidar Colaborador
              </h3>
              <form onSubmit={handleInvite} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite o email do usuário"
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={inviting}
                />
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? 'Enviando...' : 'Convidar'}
                </button>
              </form>
            </div>
          )}

          <div>
            <h3 className="text-white font-semibold mb-3">
              Colaboradores Ativos ({collaborators.length})
            </h3>
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Carregando...
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nenhum colaborador ainda
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
                  >
                    <div className="flex items-center gap-3">
                      {collaborator.userAvatarUrl ? (
                        <img
                          src={collaborator.userAvatarUrl}
                          alt={collaborator.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                          {collaborator.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {collaborator.userName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {collaborator.userEmail}
                        </p>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(collaborator.id, collaborator.userName)}
                        className="text-red-500 hover:text-red-400 transition p-2"
                        title="Remover colaborador"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsModal;
