import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { ProfileMenu } from '../components/ProfileMenu';
import { Key, Lock, Save, ArrowLeft } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (currentPassword === newPassword) {
      setError('A nova senha deve ser diferente da senha atual');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar chamada à API para mudar senha
      // await passwordService.changePassword({ currentPassword, newPassword });
      
      // Simulação temporária
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Senha alterada com sucesso!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black relative flex flex-col">
        <div className="absolute top-4 right-4 z-10">
          <ProfileMenu />
        </div>

        <div className="p-8 flex-1 max-w-2xl mx-auto w-full">
          <button
            onClick={() => navigate('/profile')}
            className="text-spotify-lightgray hover:text-white transition-colors mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Perfil
          </button>

          <div className="mb-8">
            <h1 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
              <Key className="w-10 h-10 text-spotify-green" />
              Redefinir Senha
            </h1>
            <p className="text-spotify-lightgray text-lg">
              Altere sua senha de acesso
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 px-6 py-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-500 px-6 py-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          <div className="bg-spotify-darkgray rounded-lg p-8 border border-spotify-gray">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-spotify-lightgray mb-2 font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-black text-white px-4 py-3 rounded-lg border border-spotify-gray focus:border-spotify-green focus:outline-none"
                  required
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="pt-4 border-t border-spotify-gray">
                <div className="mb-6">
                  <label className="block text-spotify-lightgray mb-2 font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black text-white px-4 py-3 rounded-lg border border-spotify-gray focus:border-spotify-green focus:outline-none"
                    required
                    minLength={6}
                    placeholder="Digite sua nova senha (mín. 6 caracteres)"
                  />
                </div>

                <div>
                  <label className="block text-spotify-lightgray mb-2 font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black text-white px-4 py-3 rounded-lg border border-spotify-gray focus:border-spotify-green focus:outline-none"
                    required
                    minLength={6}
                    placeholder="Digite novamente a nova senha"
                  />
                </div>
              </div>

              <div className="bg-spotify-gray/50 rounded-lg p-4 mt-6">
                <p className="text-spotify-lightgray text-sm">
                  <strong className="text-white">Dicas para uma senha segura:</strong>
                  <br />
                  • Use no mínimo 6 caracteres
                  <br />
                  • Combine letras maiúsculas e minúsculas
                  <br />
                  • Inclua números e caracteres especiais
                  <br />• Não use informações pessoais óbvias
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-spotify-green text-black px-6 py-3 rounded-full hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-lg"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-8 bg-spotify-gray text-white py-3 rounded-full hover:bg-spotify-gray/80 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

