import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { musicService } from '../services/musicService';
import { MusicCard } from '../components/MusicCard';
import { Sidebar } from '../components/Sidebar';
import { Search as SearchIcon } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: musics, isLoading } = useQuery({
    queryKey: ['musics'],
    queryFn: musicService.getAllMusics,
  });

  const filteredMusics = musics?.filter((music) => {
    const term = searchTerm.toLowerCase();
    return (
      music.name.toLowerCase().includes(term) ||
      music.band.toLowerCase().includes(term) ||
      music.genre.toLowerCase().includes(term) ||
      music.createdByUserName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-white text-4xl font-bold mb-6">Buscar</h1>
            <div className="relative max-w-xl">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-spotify-lightgray w-6 h-6" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-black pl-14 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green text-lg"
                placeholder="Buscar músicas, artistas ou gêneros..."
              />
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
            </div>
          )}

          {!isLoading && searchTerm && filteredMusics && filteredMusics.length === 0 && (
            <div className="text-center py-20">
              <p className="text-spotify-lightgray text-xl">
                Nenhum resultado encontrado para "{searchTerm}"
              </p>
            </div>
          )}

          {!isLoading && searchTerm && filteredMusics && filteredMusics.length > 0 && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-4">
                {filteredMusics.length} resultado(s) encontrado(s)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMusics.map((music) => (
                  <MusicCard key={music.id} music={music} />
                ))}
              </div>
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-20">
              <p className="text-spotify-lightgray text-xl">
                Digite algo para buscar músicas
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

