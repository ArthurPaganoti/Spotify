import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { musicService } from '../services/musicService';
import { playlistService } from '../services/playlistService';
import { MusicCard } from '../components/MusicCard';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { ProfileMenu } from '../components/ProfileMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MusicGridSkeleton } from '../components/SkeletonLoaders';
import { PlayCircle, RefreshCw, Music, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; musicId: string; musicName: string }>({
    isOpen: false,
    musicId: '',
    musicName: '',
  });

  const { data: musicsData, isLoading, error, refetch } = useQuery({
    queryKey: ['musics'],
    queryFn: musicService.getAllMusics,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: publicPlaylists, isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ['publicPlaylists'],
    queryFn: playlistService.getPublicPlaylists,
  });

  const musics = musicsData?.content || [];

  const handleLikeChange = async () => {
    await queryClient.invalidateQueries({ queryKey: ['musics'] });
    await queryClient.invalidateQueries({ queryKey: ['likedMusics'] });
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, musicId: id, musicName: name });
  };

  const handleConfirmDelete = async () => {
    const { musicId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, musicId: '', musicName: '' });

    try {
      await musicService.deleteMusic(musicId);
      toast.success('Música deletada com sucesso!');
      refetch();
    } catch (error: any) {
      // Error is already handled by axios interceptor
      console.error('Delete error:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, musicId: '', musicName: '' });
  };

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black relative flex flex-col">
        {/* Menu de Perfil no canto superior direito */}
        <div className="absolute top-4 right-4 z-10">
          <ProfileMenu />
        </div>

        <div className="p-8 flex-1">
          <div className="mb-8">
            <h1 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
              <PlayCircle className="w-10 h-10 text-spotify-green" />
              Bem-vindo ao Wild Music
            </h1>
            <p className="text-spotify-lightgray text-lg">
              Explore e gerencie suas músicas favoritas
            </p>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="mt-4 bg-spotify-green text-black px-6 py-2 rounded-full hover:bg-purple-500 transition-colors flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Recarregar Músicas
            </button>
          </div>

          {/* Seção de Playlists Públicas */}
          {publicPlaylists && publicPlaylists.length > 0 && (
            <div className="mb-12">
              <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-green-500" />
                Playlists Públicas
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {publicPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition cursor-pointer group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-md mb-3 flex items-center justify-center">
                      {playlist.imageUrl ? (
                        <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Music className="w-12 h-12 text-white opacity-50" />
                      )}
                    </div>
                    <h3 className="text-white font-semibold truncate mb-1">{playlist.name}</h3>
                    <p className="text-spotify-lightgray text-sm truncate">
                      Por {playlist.userName}
                    </p>
                    <p className="text-spotify-lightgray text-xs mt-1">
                      {playlist.musicCount} {playlist.musicCount === 1 ? 'música' : 'músicas'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção de Músicas */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">Todas as Músicas</h2>

            {isLoading && <MusicGridSkeleton count={6} />}

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 px-6 py-4 rounded-lg">
                <p className="font-bold mb-2">Erro ao carregar músicas:</p>
                <p className="text-sm">{(error as any)?.message || 'Erro desconhecido'}</p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!isLoading && !error && musics.length === 0 && (
              <div className="text-center py-20">
                <p className="text-spotify-lightgray text-xl">
                  Nenhuma música encontrada. Adicione sua primeira música!
                </p>
              </div>
            )}

            {!isLoading && !error && musics.length > 0 && (
              <div>
                <p className="text-spotify-lightgray mb-4">
                  {musics.length} música(s) encontrada(s) {musicsData?.totalElements && `de ${musicsData.totalElements} total`}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {musics.map((music) => (
                    <MusicCard
                      key={music.id}
                      music={music}
                      onDelete={() => handleDeleteClick(music.id, music.name)}
                      canDelete={true}
                      onLikeChange={handleLikeChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Deletar Música"
        message={`Tem certeza que deseja deletar "${deleteConfirm.musicName}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};
