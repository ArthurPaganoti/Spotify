import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { playlistService } from '../services/playlistService';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { ProfileMenu } from '../components/ProfileMenu';
import { Library as LibraryIcon, Plus, Lock, Globe, Music, Pencil, Trash2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { CreatePlaylistRequest, PlaylistDTO, UpdatePlaylistRequest } from '../types';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistDTO | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePlaylistRequest>({
    name: '',
    isPublic: false,
  });

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['myPlaylists'],
    queryFn: playlistService.getMyPlaylists,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { request: CreatePlaylistRequest; image?: File }) => {
      const playlist = await playlistService.createPlaylist(data.request);
      if (data.image) {
        await playlistService.updatePlaylistImage(playlist.id, data.image);
      }
      return playlist;
    },
    onSuccess: () => {
      toast.success('Playlist criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['myPlaylists'] });
      setShowCreateModal(false);
      setFormData({ name: '', isPublic: false });
      setImageFile(null);
      setImagePreview(null);
    },
    onError: () => {
      toast.error('Erro ao criar playlist');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, image }: { id: number; data: UpdatePlaylistRequest; image?: File }) => {
      const playlist = await playlistService.updatePlaylist(id, data);
      if (image) {
        await playlistService.updatePlaylistImage(id, image);
      }
      return playlist;
    },
    onSuccess: () => {
      toast.success('Playlist atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['myPlaylists'] });
      setShowEditModal(false);
      setSelectedPlaylist(null);
      setImageFile(null);
      setImagePreview(null);
    },
    onError: () => {
      toast.error('Erro ao atualizar playlist');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: playlistService.deletePlaylist,
    onSuccess: () => {
      toast.success('Playlist deletada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['myPlaylists'] });
    },
    onError: () => {
      toast.error('Erro ao deletar playlist');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nome da playlist é obrigatório');
      return;
    }
    createMutation.mutate({ request: formData, image: imageFile || undefined });
  };

  const handleUpdatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist || !formData.name.trim()) {
      toast.error('Nome da playlist é obrigatório');
      return;
    }
    updateMutation.mutate({
      id: selectedPlaylist.id,
      data: {
        name: formData.name,
        isPublic: formData.isPublic,
      },
      image: imageFile || undefined,
    });
  };

  const handleEditClick = (playlist: PlaylistDTO) => {
    setSelectedPlaylist(playlist);
    setFormData({
      name: playlist.name,
      isPublic: playlist.isPublic,
    });
    setImageFile(null);
    setImagePreview(null);
    setShowEditModal(true);
  };

  const handleDeleteClick = (playlist: PlaylistDTO) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Tem certeza que deseja deletar "{playlist.name}"?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteMutation.mutate(playlist.id);
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
          >
            Sim, deletar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-b from-purple-900 to-gray-900 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <LibraryIcon className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Sua Biblioteca</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full font-semibold transition"
              >
                <Plus className="w-5 h-5" />
                Criar Playlist
              </button>
              <ProfileMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition cursor-pointer group"
                >
                  <div
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    className="aspect-square bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center"
                  >
                    {playlist.imageUrl ? (
                      <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-24 h-24 text-white opacity-50" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{playlist.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {playlist.musicCount} {playlist.musicCount === 1 ? 'música' : 'músicas'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {playlist.isPublic ? (
                            <>
                              <Globe className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-500">Pública</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-gray-500" />
                              <span className="text-xs text-gray-500">Privada</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(playlist);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(playlist);
                          }}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <LibraryIcon className="w-16 h-16 mb-4" />
              <p className="text-xl mb-2">Nenhuma playlist criada ainda</p>
              <p className="text-sm mb-4">Crie sua primeira playlist para começar!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-semibold transition"
              >
                <Plus className="w-5 h-5" />
                Criar Playlist
              </button>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* Modal de Criar Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Criar Nova Playlist</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Playlist</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Minha Playlist"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Imagem da Playlist (opcional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="flex-1 cursor-pointer bg-gray-700 rounded-lg px-4 py-2 text-center transition hover:bg-gray-600"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">Clique ou arraste para fazer upload</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                  Tornar playlist pública
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Playlist */}
      {showEditModal && selectedPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Editar Playlist</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Playlist</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Minha Playlist"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Imagem da Playlist (opcional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageUploadEdit"
                  />
                  <label
                    htmlFor="imageUploadEdit"
                    className="flex-1 cursor-pointer bg-gray-700 rounded-lg px-4 py-2 text-center transition hover:bg-gray-600"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">Clique ou arraste para fazer upload</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublicEdit"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="isPublicEdit" className="text-sm font-medium cursor-pointer">
                  Tornar playlist pública
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
