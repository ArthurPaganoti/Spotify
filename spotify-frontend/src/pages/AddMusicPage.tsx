import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Plus } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { musicService } from '../services/musicService';
import { useQueryClient } from '@tanstack/react-query';

export const AddMusicPage: React.FC = () => {
  const [name, setName] = useState('');
  const [band, setBand] = useState('');
  const [genre, setGenre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await musicService.addMusic({ name, band, genre });
      await queryClient.invalidateQueries({ queryKey: ['musics'] });
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao adicionar música.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black flex flex-col">
        <div className="p-8 flex-1">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
                <Plus className="w-10 h-10 text-spotify-green" />
                Adicionar Nova Música
              </h1>
              <p className="text-spotify-lightgray text-lg">
                Preencha os dados abaixo para adicionar uma música à biblioteca
              </p>
            </div>

            <div className="bg-spotify-gray rounded-lg p-8 shadow-2xl">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-white font-semibold mb-2">
                    Nome da Música *
                  </label>
                  <div className="relative">
                    <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-spotify-lightgray w-5 h-5" />
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-spotify-darkgray text-white pl-12 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green"
                      placeholder="Ex: Bohemian Rhapsody"
                      required
                      maxLength={200}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="band" className="block text-white font-semibold mb-2">
                    Artista/Banda *
                  </label>
                  <input
                    type="text"
                    id="band"
                    value={band}
                    onChange={(e) => setBand(e.target.value)}
                    className="w-full bg-spotify-darkgray text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green"
                    placeholder="Ex: Queen"
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <label htmlFor="genre" className="block text-white font-semibold mb-2">
                    Gênero *
                  </label>
                  <input
                    type="text"
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-spotify-darkgray text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green"
                    placeholder="Ex: Rock"
                    required
                    maxLength={50}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adicionando...' : 'Adicionar Música'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="px-8 bg-spotify-darkgray text-white font-bold py-3 rounded-full hover:bg-spotify-gray transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};
