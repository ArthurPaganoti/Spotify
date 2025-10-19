import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { musicService } from '../services/musicService';
import { MusicCard } from '../components/MusicCard';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { PlayCircle, RefreshCw } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: musics, isLoading, error, refetch } = useQuery({
    queryKey: ['musics'],
    queryFn: musicService.getAllMusics,
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta música?')) {
      try {
        await musicService.deleteMusic(id);
        refetch();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erro ao deletar música');
      }
    }
  };

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black relative flex flex-col">
        {/* Imagem do corvo discreta no canto */}
        <img
          src="/papagaio-icon.png"
          alt=""
          className="absolute top-8 right-8 w-16 h-16 opacity-10 pointer-events-none"
        />

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
              className="mt-4 bg-spotify-green text-black px-6 py-2 rounded-full hover:bg-purple-500 transition-colors flex items-center gap-2 font-semibold"
            >
              <RefreshCw className="w-5 h-5" />
              Recarregar Músicas
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
            </div>
          )}

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

          {!isLoading && !error && musics && musics.length === 0 && (
            <div className="text-center py-20">
              <p className="text-spotify-lightgray text-xl">
                Nenhuma música encontrada. Adicione sua primeira música!
              </p>
            </div>
          )}

          {!isLoading && !error && musics && musics.length > 0 && (
            <div>
              <p className="text-spotify-lightgray mb-4">
                {musics.length} música(s) encontrada(s)
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {musics.map((music) => (
                  <MusicCard
                    key={music.id}
                    music={music}
                    onDelete={handleDelete}
                    canDelete={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
};
