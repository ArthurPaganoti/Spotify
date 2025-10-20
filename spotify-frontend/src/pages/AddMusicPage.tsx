import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Plus, Image as ImageIcon, X, FileText, Edit3 } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { ProfileMenu } from '../components/ProfileMenu';
import { musicService } from '../services/musicService';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { musicByLyricsSchema, type MusicByLyricsFormData } from '../validators/musicSchemas';

interface MusicOption {
  videoId: string;
  thumbnailUrl: string;
  musicName: string;
  bandName: string;
  originalTitle: string;
}

interface ValidationErrors {
  lyrics?: string;
  genre?: string;
}

type TabType = 'manual' | 'lyrics';

export const AddMusicPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('manual');

  const [name, setName] = useState('');
  const [band, setBand] = useState('');
  const [genre, setGenre] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [lyrics, setLyrics] = useState('');
  const [lyricsGenre, setLyricsGenre] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [options, setOptions] = useState<MusicOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [addingMusic, setAddingMusic] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await musicService.addMusic({ name, genre, band }, image || undefined);
      queryClient.invalidateQueries({ queryKey: ['musics'] });
      toast.success('🎵 Música adicionada com sucesso!');
      navigate('/home');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao adicionar música';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLyricsSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setSearchLoading(true);
    setShowOptions(false);

    // Validação com Zod
    try {
      const formData: MusicByLyricsFormData = {
        lyrics: lyrics.trim(),
        genre: lyricsGenre.trim() || undefined,
      };

      musicByLyricsSchema.parse(formData);
    } catch (err: any) {
      if (err.issues) {
        const errors: ValidationErrors = {};
        err.issues.forEach((issue: any) => {
          errors[issue.path[0] as keyof ValidationErrors] = issue.message;
        });
        setValidationErrors(errors);
        toast.error('Corrija os erros no formulário');
      }
      setSearchLoading(false);
      return;
    }

    try {
      const results = await musicService.searchLyricsOptions(lyrics);
      if (results.length === 0) {
        setError('Nenhuma música encontrada com esse trecho de letra. Tente outro trecho.');
        toast.error('Nenhuma música encontrada');
      } else {
        setOptions(results);
        setShowOptions(true);
        toast.success(`${results.length} opções encontradas!`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar músicas. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectMusic = async (option: MusicOption) => {
    setAddingMusic(true);
    setError('');

    try {
      await musicService.addSelectedMusic(
        option.videoId,
        option.thumbnailUrl,
        option.musicName,
        option.bandName,
        lyricsGenre
      );
      queryClient.invalidateQueries({ queryKey: ['musics'] });
      toast.success(`🎵 ${option.musicName} adicionada com sucesso!`);
      navigate('/home');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao adicionar música. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAddingMusic(false);
    }
  };

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black flex flex-col relative">
        <div className="absolute top-4 right-4 z-10">
          <ProfileMenu />
        </div>

        <div className="p-8 flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
                <Plus className="w-10 h-10 text-spotify-green" />
                Adicionar Nova Música
              </h1>
              <p className="text-spotify-lightgray text-lg">
                Escolha como deseja adicionar sua música
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setActiveTab('manual');
                  setError('');
                  setShowOptions(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'manual'
                    ? 'bg-spotify-green text-white shadow-lg'
                    : 'bg-spotify-gray text-spotify-lightgray hover:bg-spotify-darkgray'
                }`}
              >
                <Edit3 className="w-5 h-5" />
                Adicionar Manualmente
              </button>
              <button
                onClick={() => {
                  setActiveTab('lyrics');
                  setError('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'lyrics'
                    ? 'bg-spotify-green text-white shadow-lg'
                    : 'bg-spotify-gray text-spotify-lightgray hover:bg-spotify-darkgray'
                }`}
              >
                <FileText className="w-5 h-5" />
                Buscar por Letra
              </button>
            </div>

            <div className="bg-spotify-gray rounded-lg p-8 shadow-2xl">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}

              {/* Conteúdo da Tab Manual */}
              {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  {/* Upload de Imagem */}
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Capa da Música
                    </label>
                    <p className="text-spotify-lightgray text-sm mb-3">
                      Dimensão recomendada: 640x640 pixels
                    </p>

                    {!imagePreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-spotify-lightgray rounded-lg cursor-pointer hover:border-spotify-green transition-colors bg-spotify-darkgray">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-12 h-12 text-spotify-lightgray mb-3" />
                          <p className="text-sm text-spotify-lightgray mb-1">
                            <span className="font-semibold text-white">Clique para fazer upload</span> ou arraste a imagem
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
                      Gênero <span className="text-spotify-lightgray text-xs">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-spotify-darkgray text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green"
                      placeholder="Ex: Rock, Pop, Hip Hop, etc. (deixe em branco se não souber)"
                      maxLength={50}
                    />
                    <p className="text-xs text-spotify-lightgray mt-1">
                      Se não preencher, será definido como "Desconhecido"
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-spotify-green text-white font-bold py-3 rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              )}

              {/* Conteúdo da Tab Por Letra */}
              {activeTab === 'lyrics' && !showOptions && (
                <form onSubmit={handleLyricsSearch} className="space-y-6">
                  <div>
                    <label htmlFor="lyrics" className="block text-white font-semibold mb-2">
                      Trecho da Letra *
                    </label>
                    <textarea
                      id="lyrics"
                      value={lyrics}
                      onChange={(e) => {
                        setLyrics(e.target.value);
                        if (validationErrors.lyrics) {
                          setValidationErrors({ ...validationErrors, lyrics: undefined });
                        }
                      }}
                      rows={6}
                      className={`w-full px-4 py-3 bg-spotify-darkgray border ${
                        validationErrors.lyrics ? 'border-red-500' : 'border-spotify-lightgray'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green text-white`}
                      placeholder="Ex: I see a red door and I want it painted black..."
                      required
                    />
                    {validationErrors.lyrics && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.lyrics}</p>
                    )}
                    <p className="text-xs text-spotify-lightgray mt-1">
                      Digite qualquer trecho da letra que você se lembra (mínimo 10 caracteres)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Caracteres: {lyrics.length} / 1000
                    </p>
                  </div>

                  <div>
                    <label htmlFor="lyricsGenre" className="block text-white font-semibold mb-2">
                      Gênero Musical <span className="text-spotify-lightgray text-xs">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      id="lyricsGenre"
                      value={lyricsGenre}
                      onChange={(e) => {
                        setLyricsGenre(e.target.value);
                        if (validationErrors.genre) {
                          setValidationErrors({ ...validationErrors, genre: undefined });
                        }
                      }}
                      className={`w-full px-4 py-3 bg-spotify-darkgray border ${
                        validationErrors.genre ? 'border-red-500' : 'border-spotify-lightgray'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green text-white`}
                      placeholder="Ex: Rock, Pop, Hip Hop, etc."
                      maxLength={50}
                    />
                    {validationErrors.genre && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.genre}</p>
                    )}
                    <p className="text-xs text-spotify-lightgray mt-1">
                      Se não preencher, será definido como "Desconhecido"
                    </p>
                  </div>

                  <div className="bg-spotify-darkgray border border-spotify-lightgray rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-spotify-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium text-white mb-1">Como funciona?</p>
                        <ul className="text-spotify-lightgray space-y-1">
                          <li>• Buscamos no YouTube usando o trecho da letra</li>
                          <li>• Mostramos as melhores opções encontradas</li>
                          <li>• Você escolhe qual música deseja adicionar</li>
                          <li>• A capa vem automaticamente do YouTube 🎵</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="flex-1 bg-spotify-green text-white font-bold py-3 rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {searchLoading ? (
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
                          Buscar Músicas
                        </>
                      )}
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
              )}

              {/* Resultados da busca por letra */}
              {activeTab === 'lyrics' && showOptions && options.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Escolha a música</h2>
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        setOptions([]);
                      }}
                      className="text-spotify-lightgray hover:text-white flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Nova busca
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {options.map((option) => (
                      <div
                        key={option.videoId}
                        className="bg-spotify-darkgray rounded-lg p-4 flex items-center gap-4 hover:bg-spotify-lightgray/10 transition-colors"
                      >
                        <img
                          src={option.thumbnailUrl}
                          alt={option.musicName}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">{option.musicName}</h3>
                          <p className="text-spotify-lightgray">{option.bandName}</p>
                          <p className="text-xs text-gray-500 mt-1">{option.originalTitle}</p>
                        </div>
                        <button
                          onClick={() => handleSelectMusic(option)}
                          disabled={addingMusic}
                          className="bg-spotify-green text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingMusic ? 'Adicionando...' : 'Adicionar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};
