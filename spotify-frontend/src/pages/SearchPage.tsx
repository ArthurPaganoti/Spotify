import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { musicService } from '../services/musicService';
import { MusicCard } from '../components/MusicCard';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { ProfileMenu } from '../components/ProfileMenu';
import { MusicGridSkeleton } from '../components/SkeletonLoaders';
import { useDebounce } from '../hooks/useDebounce';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: musicsData, isLoading} = useQuery({
    queryKey: ['musics'],
    queryFn: musicService.getAllMusics,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const musics = musicsData?.content || [];
  const isSearching = searchTerm !== debouncedSearchTerm;

  const handleLikeChange = async () => {
    await queryClient.invalidateQueries({ queryKey: ['musics'] });
    await queryClient.invalidateQueries({ queryKey: ['likedMusics'] });
  };

  const filteredMusics = musics?.filter((music) => {
    const term = debouncedSearchTerm.toLowerCase();
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
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black flex flex-col relative">
        <div className="absolute top-4 right-4 z-10">
          <ProfileMenu />
        </div>

        <div className="p-8 flex-1">
          <div className="mb-8">
            <h1 className="text-white text-4xl font-bold mb-6">Buscar</h1>
            <div className="relative max-w-xl">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-spotify-lightgray w-6 h-6" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-black pl-14 pr-12 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green text-lg"
                placeholder="Buscar músicas, artistas ou gêneros..."
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-spotify-green w-6 h-6 animate-spin" />
              )}
            </div>
            {searchTerm && (
              <p className="text-spotify-lightgray text-sm mt-2 ml-2">
                Buscando por: <span className="text-white font-semibold">"{searchTerm}"</span>
              </p>
            )}
          </div>

          {isLoading && <MusicGridSkeleton count={4} />}

          {!isLoading && debouncedSearchTerm && filteredMusics && filteredMusics.length === 0 && (
            <div className="text-center py-20">
              <p className="text-spotify-lightgray text-xl">
                Nenhum resultado encontrado para "{debouncedSearchTerm}"
              </p>
            </div>
          )}

          {!isLoading && debouncedSearchTerm && filteredMusics && filteredMusics.length > 0 && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-4">
                {filteredMusics.length} resultado(s) encontrado(s)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMusics.map((music) => (
                  <MusicCard
                    key={music.id}
                    music={music}
                    onLikeChange={handleLikeChange}
                  />
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

        <Footer />
      </main>
    </div>
  );
};
