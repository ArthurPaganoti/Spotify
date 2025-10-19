import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistService } from '../services/playlistService';
import { musicService } from '../services/musicService';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { ProfileMenu } from '../components/ProfileMenu';
import { MusicPlayer } from '../components/MusicPlayer';
import { Lock, Globe, Music as MusicIcon, Plus, Trash2, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { MusicResponseDTO } from '../types';

export const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [showAddMusicModal, setShowAddMusicModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => playlistService.getPlaylistById(Number(id)),
    enabled: !!id,
  });

  const { data: allMusics } = useQuery({
    queryKey: ['allMusics'],
    queryFn: musicService.getAllMusics,
    enabled: showAddMusicModal,
  });

  const addMusicMutation = useMutation({
    mutationFn: ({ playlistId, musicId }: { playlistId: number; musicId: string }) =>
      playlistService.addMusicToPlaylist(playlistId, { musicId }),
    onSuccess: () => {
      toast.success('Música adicionada à playlist!');
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
      queryClient.invalidateQueries({ queryKey: ['myPlaylists'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao adicionar música');
    },
  });

  const removeMusicMutation = useMutation({
    mutationFn: ({ playlistId, musicId }: { playlistId: number; musicId: string }) =>
      playlistService.removeMusicFromPlaylist(playlistId, musicId),
    onSuccess: () => {
      toast.success('Música removida da playlist!');
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
      queryClient.invalidateQueries({ queryKey: ['myPlaylists'] });
    },
    onError: () => {
      toast.error('Erro ao remover música');
    },
  });

  const handleAddMusic = (musicId: string) => {
    if (!playlist) return;
    addMusicMutation.mutate({ playlistId: playlist.id, musicId });
  };

  const handleRemoveMusic = (musicId: string) => {
    if (!playlist) return;
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Remover esta música da playlist?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              removeMusicMutation.mutate({ playlistId: playlist.id, musicId });
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
          >
            Sim, remover
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

  const filteredMusics = allMusics?.filter((music: MusicResponseDTO) => {
    const query = searchQuery.toLowerCase();
    return (
      music.name.toLowerCase().includes(query) ||
      music.band.toLowerCase().includes(query) ||
      music.genre.toLowerCase().includes(query)
    );
  });

  const playlistMusicIds = playlist?.musics.map(m => m.id) || [];
  const availableMusics = filteredMusics?.filter((music: MusicResponseDTO) => !playlistMusicIds.includes(music.id));

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Playlist não encontrada</h1>
          <button
            onClick={() => navigate('/library')}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-semibold"
          >
            Voltar para Biblioteca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-b from-purple-900 to-gray-900 p-6">
          <div className="flex items-center gap-6">
            <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              {playlist.imageUrl ? (
                <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <MusicIcon className="w-24 h-24 text-white opacity-50" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {playlist.isPublic ? (
                  <>
                    <Globe className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-500 font-semibold">Playlist Pública</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400 font-semibold">Playlist Privada</span>
                  </>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-4">{playlist.name}</h1>
              <p className="text-gray-300">
                Por <span className="font-semibold">{playlist.userName}</span> • {playlist.musics.length}{' '}
                {playlist.musics.length === 1 ? 'música' : 'músicas'}
              </p>
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => setShowAddMusicModal(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-semibold transition"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Músicas
                </button>
                <button
                  onClick={() => navigate('/library')}
                  className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full font-semibold transition"
                >
                  Voltar
                </button>
              </div>
            </div>
            <ProfileMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {playlist.musics.length > 0 ? (
            <div className="space-y-2">
              {playlist.musics.map((music, index) => (
                <div
                  key={music.id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800 transition group"
                >
                  <span className="text-gray-400 font-semibold w-8 text-center">{index + 1}</span>
                  <div
                    className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition"
                    onClick={() => setCurrentMusic(music.youtubeVideoId || null)}
                  >
                    {music.imageUrl || music.youtubeThumbnailUrl ? (
                      <img
                        src={music.imageUrl || music.youtubeThumbnailUrl}
                        alt={music.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <MusicIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{music.name}</h3>
                    <p className="text-sm text-gray-400 truncate">{music.band}</p>
                  </div>
                  <span className="text-sm text-gray-400 hidden md:block">{music.genre}</span>
                  <button
                    onClick={() => handleRemoveMusic(music.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <MusicIcon className="w-16 h-16 mb-4" />
              <p className="text-xl mb-2">Playlist vazia</p>
              <p className="text-sm mb-4">Adicione músicas para começar a ouvir!</p>
              <button
                onClick={() => setShowAddMusicModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-semibold transition"
              >
                <Plus className="w-5 h-5" />
                Adicionar Músicas
              </button>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {currentMusic && <MusicPlayer videoId={currentMusic} onClose={() => setCurrentMusic(null)} />}

      {/* Modal de Adicionar Música */}
      {showAddMusicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold">Adicionar Músicas</h2>
              <button onClick={() => setShowAddMusicModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar músicas..."
                  className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {availableMusics && availableMusics.length > 0 ? (
                <div className="space-y-2">
                  {availableMusics.map((music: MusicResponseDTO) => (
                    <div
                      key={music.id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-700 transition"
                    >
                      <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                        {music.imageUrl || music.youtubeThumbnailUrl ? (
                          <img
                            src={music.imageUrl || music.youtubeThumbnailUrl}
                            alt={music.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <MusicIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{music.name}</h3>
                        <p className="text-sm text-gray-400 truncate">
                          {music.band} • {music.genre}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddMusic(music.id)}
                        disabled={addMusicMutation.isPending}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full font-semibold transition disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <MusicIcon className="w-16 h-16 mb-4" />
                  <p className="text-xl">
                    {searchQuery ? 'Nenhuma música encontrada' : 'Todas as músicas já foram adicionadas'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

