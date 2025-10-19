import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Music, Edit, Image as ImageIcon, X } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { musicService } from '../services/musicService';
import { useQueryClient } from '@tanstack/react-query';

export const EditMusicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [band, setBand] = useState('');
  const [genre, setGenre] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadMusic = async () => {
      if (!id) return;
      
      try {
        setLoadingData(true);
        const music = await musicService.getMusicById(id);
        setName(music.name);
        setBand(music.band);
        setGenre(music.genre);
        setCurrentImageUrl(music.imageUrl || null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao carregar música.');
      } finally {
        setLoadingData(false);
      }
    };

    loadMusic();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }

      setImage(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');
    setLoading(true);

    try {
      await musicService.updateMusic(id, { name, band, genre }, image || undefined);
      await queryClient.invalidateQueries({ queryKey: ['musics'] });
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar música.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Carregando...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black flex flex-col">
        <div className="p-8 flex-1">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
                <Edit className="w-10 h-10 text-spotify-green" />
                Editar Música
              </h1>
              <p className="text-spotify-lightgray text-lg">
                Atualize as informações da música
              </p>
            </div>

            <div className="bg-spotify-gray rounded-lg p-8 shadow-2xl">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload de Imagem */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Capa da Música
                  </label>
                  <p className="text-spotify-lightgray text-sm mb-3">
                    Dimensão recomendada: 640x640 pixels
                  </p>

                  {!imagePreview ? (
                    <div>
                      {currentImageUrl && (
                        <div className="mb-4">
                          <p className="text-spotify-lightgray text-sm mb-2">Imagem atual:</p>
                          <img
                            src={currentImageUrl}
                            alt="Current"
                            className="w-48 h-48 object-cover rounded-lg shadow-lg mx-auto"
                          />
                        </div>
                      )}
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-spotify-lightgray rounded-lg cursor-pointer hover:border-spotify-green transition-colors bg-spotify-darkgray">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-12 h-12 text-spotify-lightgray mb-3" />
                          <p className="text-sm text-spotify-lightgray mb-1">
                            <span className="font-semibold text-white">Clique para alterar a imagem</span> ou arraste
                          </p>
                          <p className="text-xs text-spotify-lightgray">
                            PNG, JPG ou JPEG (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative w-48 h-48 mx-auto">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

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
                    className="flex-1 bg-spotify-green text-white font-bold py-3 rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Atualizando...' : 'Atualizar Música'}
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

