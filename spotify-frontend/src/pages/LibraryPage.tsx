import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { musicService } from '../services/musicService';
import { MusicCard } from '../components/MusicCard';
import { Sidebar } from '../components/Sidebar';
import { Library as LibraryIcon } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const { data: musics, isLoading, refetch } = useQuery({
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
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
              <LibraryIcon className="w-10 h-10 text-spotify-green" />
              Sua Biblioteca
            </h1>
            <p className="text-spotify-lightgray text-lg">
              Todas as suas músicas em um só lugar
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
            </div>
          )}

          {musics && musics.length === 0 && (
            <div className="text-center py-20">
              <p className="text-spotify-lightgray text-xl">
                Sua biblioteca está vazia. Comece adicionando músicas!
              </p>
            </div>
          )}

          {musics && musics.length > 0 && (
            <div>
              <div className="mb-4 text-spotify-lightgray">
                {musics.length} música(s) na biblioteca
              </div>
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
      </main>
    </div>
  );
};
