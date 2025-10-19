import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { musicService } from '../services/musicService';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const AddMusicByLyricsPage: React.FC = () => {
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState('');
  const [genre, setGenre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!lyrics.trim() || !genre.trim()) {
      setError('Por favor, preencha o trecho da letra e o gênero');
      setLoading(false);
      return;
    }

    try {
      await musicService.addMusicByLyrics(lyrics, genre);
      navigate('/library');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao adicionar música. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <button
                onClick={() => navigate('/library')}
                className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
              <h1 className="text-4xl font-bold mb-2">Adicionar Música por Letra</h1>
              <p className="text-gray-400">Escreva um trecho da letra que você se lembra e encontraremos a música para você!</p>
            </div>

            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-lg p-6 space-y-6">
              <div>
                <label htmlFor="lyrics" className="block text-sm font-medium mb-2">
                  Trecho da Letra *
                </label>
                <textarea
                  id="lyrics"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  placeholder="Ex: I see a red door and I want it painted black..."
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Digite qualquer trecho da letra que você se lembra
                </p>
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium mb-2">
                  Gênero Musical *
                </label>
                <input
                  type="text"
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  placeholder="Ex: Rock, Pop, Hip Hop, etc."
                  required
                />
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Como funciona?</p>
                    <ul className="text-gray-400 space-y-1">
                      <li>• Buscamos no YouTube usando o trecho da letra que você digitou</li>
                      <li>• Pegamos automaticamente a primeira música encontrada</li>
                      <li>• O nome e artista são extraídos do título do vídeo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/library')}
                  className="flex-1 px-6 py-3 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Buscar e Adicionar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AddMusicByLyricsPage;

