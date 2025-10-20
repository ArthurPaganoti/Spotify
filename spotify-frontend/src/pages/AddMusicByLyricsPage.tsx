import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { musicService } from '../services/musicService';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { musicByLyricsSchema, type MusicByLyricsFormData } from '../validators/musicSchemas';
import toast from 'react-hot-toast';

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

const AddMusicByLyricsPage: React.FC = () => {
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState('');
  const [genre, setGenre] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<MusicOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [addingMusic, setAddingMusic] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setLoading(true);
    setShowOptions(false);

    // Validação com Zod
    try {
      const formData: MusicByLyricsFormData = {
        lyrics: lyrics.trim(),
        genre: genre.trim() || undefined,
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
      setLoading(false);
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
      setLoading(false);
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
        genre
      );
      toast.success(`🎵 ${option.musicName} adicionada com sucesso!`);
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao adicionar música. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAddingMusic(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
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
              <p className="text-gray-400">Escreva um trecho da letra que você se lembra e escolha entre as opções encontradas!</p>
            </div>

            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {!showOptions && (
              <form onSubmit={handleSearch} className="bg-zinc-900 rounded-lg p-6 space-y-6">
                <div>
                  <label htmlFor="lyrics" className="block text-sm font-medium mb-2">
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
                    className={`w-full px-4 py-3 bg-zinc-800 border ${
                      validationErrors.lyrics ? 'border-red-500' : 'border-zinc-700'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white`}
                    placeholder="Ex: I see a red door and I want it painted black..."
                    required
                  />
                  {validationErrors.lyrics && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.lyrics}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Digite qualquer trecho da letra que você se lembra (mínimo 10 caracteres, máximo 1000)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Caracteres: {lyrics.length} / 1000
                  </p>
                </div>

                <div>
                  <label htmlFor="genre" className="block text-sm font-medium mb-2">
                    Gênero Musical <span className="text-gray-500 text-xs">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    id="genre"
                    value={genre}
                    onChange={(e) => {
                      setGenre(e.target.value);
                      if (validationErrors.genre) {
                        setValidationErrors({ ...validationErrors, genre: undefined });
                      }
                    }}
                    className={`w-full px-4 py-3 bg-zinc-800 border ${
                      validationErrors.genre ? 'border-red-500' : 'border-zinc-700'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white`}
                    placeholder="Ex: Rock, Pop, Hip Hop, etc. (deixe em branco se não souber)"
                  />
                  {validationErrors.genre && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.genre}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Se não preencher, será definido como "Desconhecido"
                  </p>
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
                        <li>• Mostramos as 3 primeiras opções encontradas</li>
                        <li>• Você escolhe qual música deseja adicionar</li>
                        <li>• A imagem da música virá automaticamente do YouTube 🎵</li>
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
                    className="flex-1 px-6 py-3 bg-spotify-green text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
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
                        Buscar Músicas
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {showOptions && options.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Escolha a música que deseja adicionar</h2>
                  <button
                    onClick={() => {
                      setShowOptions(false);
                      setOptions([]);
                    }}
                    className="text-gray-400 hover:text-white flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Nova Busca
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {options.map((option) => (
                    <div
                      key={option.videoId}
                      className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="flex-shrink-0">
                          <img
                            src={option.thumbnailUrl}
                            alt={option.originalTitle}
                            className="w-32 h-24 object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {option.musicName}
                            </h3>
                            <p className="text-gray-400 mb-2">{option.bandName}</p>
                            <p className="text-xs text-gray-500">
                              Título original: {option.originalTitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleSelectMusic(option)}
                            disabled={addingMusic}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {addingMusic ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adicionando...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Adicionar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AddMusicByLyricsPage;
