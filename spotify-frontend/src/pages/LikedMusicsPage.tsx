import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { likeService } from '../services/likeService';
import { MusicCard } from '../components/MusicCard';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { ProfileMenu } from '../components/ProfileMenu';
import { Heart } from 'lucide-react';

export const LikedMusicsPage: React.FC = () => {
  const { data: musics, isLoading, refetch } = useQuery({
    queryKey: ['likedMusics'],
    queryFn: likeService.getLikedMusics,
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
            <h1 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
              <Heart className="w-10 h-10 text-red-500 fill-current" />
              Músicas Curtidas
            </h1>
            <p className="text-spotify-lightgray text-lg">
              Todas as músicas que você curtiu
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
            </div>
          )}

          {musics && musics.length === 0 && (
            <div className="text-center py-20">
              <Heart className="w-20 h-20 text-spotify-lightgray mx-auto mb-4 opacity-50" />
              <p className="text-spotify-lightgray text-xl">
                Você ainda não curtiu nenhuma música.
              </p>
              <p className="text-spotify-lightgray text-sm mt-2">
                Explore e curta suas músicas favoritas!
              </p>
            </div>
          )}

          {musics && musics.length > 0 && (
            <div>
              <div className="mb-4 text-spotify-lightgray">
                {musics.length} música(s) curtida(s)
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {musics.map((music) => (
                  <MusicCard
                    key={music.id}
                    music={music}
                    onLikeChange={refetch}
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

