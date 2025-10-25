import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { ProfileMenu } from '../components/ProfileMenu';
import { User, Camera, Mail, Save, Trash2, Upload, Key, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      // Clear preview when user data changes from backend
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await profileService.updateProfile({ name, email });
      await refreshUser();
      setSuccess('Perfil atualizado com sucesso!');

      // Clear any error messages after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      let errorMessage = 'Erro ao atualizar perfil';

      if (err.response) {
        errorMessage = err.response.data?.message ||
                      err.response.data?.error ||
                      err.response.data ||
                      err.message ||
                      'Erro ao atualizar perfil';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      if (errorMessage.toLowerCase().includes('email') &&
          (errorMessage.toLowerCase().includes('já está sendo usado') ||
           errorMessage.toLowerCase().includes('já existe') ||
           errorMessage.toLowerCase().includes('duplicado'))) {
        setEmail(user?.email || '');
      }

      console.error('Erro detalhado:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await profileService.updateAvatar(avatarFile);
      await refreshUser();
      setSuccess('Avatar atualizado com sucesso!');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Tem certeza que deseja remover seu avatar?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDeleteAvatar();
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
          >
            Sim, remover
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const confirmDeleteAvatar = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await profileService.deleteAvatar();
      await refreshUser();
      setAvatarPreview(null);
      setAvatarFile(null);
      toast.success('Avatar removido com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao remover avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');

    try {
      await profileService.deleteAccount();
      // Logout and redirect to login page
      logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao deletar conta');
      setShowDeleteConfirm(false);
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-darkgray to-black relative flex flex-col">
        <div className="absolute top-4 right-4 z-10">
          <ProfileMenu />
        </div>

        <div className="p-8 flex-1 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-white text-4xl font-bold mb-2">Meu Perfil</h1>
            <p className="text-spotify-lightgray text-lg">
              Gerencie suas informações pessoais e foto de perfil
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

          {/* Delete Account Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-spotify-darkgray rounded-lg p-8 max-w-md w-full border border-red-500">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <h2 className="text-white text-2xl font-bold">Deletar Conta</h2>
                </div>
                <p className="text-spotify-lightgray mb-6">
                  Tem certeza que deseja deletar sua conta permanentemente?
                  <br/><br/>
                  <strong className="text-red-500">Esta ação não pode ser desfeita!</strong>
                  <br/><br/>
                  Todos os seus dados, incluindo músicas e configurações, serão removidos.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                    className="flex-1 bg-spotify-gray text-white px-6 py-3 rounded-full hover:bg-spotify-gray/80 transition-colors font-semibold disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Deletando...' : 'Sim, Deletar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Avatar Section */}
            <div className="bg-spotify-darkgray rounded-lg p-6 border border-spotify-gray">
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <Camera className="w-6 h-6 text-spotify-green" />
                Foto de Perfil
              </h2>

              <div className="flex flex-col items-center gap-4">
                {avatarPreview || user?.avatarUrl ? (
                  <img
                    src={avatarPreview || user?.avatarUrl}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-spotify-green"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-spotify-green flex items-center justify-center text-black font-bold text-4xl">
                    {user ? getInitials(user.name) : <User className="w-16 h-16" />}
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                  <label className="bg-spotify-green text-black px-4 py-2 rounded-full hover:bg-purple-500 transition-colors cursor-pointer flex items-center justify-center gap-2 font-semibold">
                    <Upload className="w-5 h-5" />
                    Escolher Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>

                  {avatarFile && (
                    <button
                      onClick={handleUpdateAvatar}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
                    >
                      <Save className="w-5 h-5" />
                      Salvar Foto
                    </button>
                  )}

                  {user?.avatarUrl && !avatarPreview && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={loading}
                      className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
                    >
                      <Trash2 className="w-5 h-5" />
                      Remover Foto
                    </button>
                  )}
                </div>

                <p className="text-spotify-lightgray text-sm text-center">
                  Tamanho máximo: 5MB
                  <br />
                  Formatos: JPG, PNG, GIF
                </p>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="bg-spotify-darkgray rounded-lg p-6 border border-spotify-gray">
              <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-spotify-green" />
                Informações Pessoais
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-spotify-lightgray mb-2 font-semibold">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black text-white px-4 py-3 rounded-lg border border-spotify-gray focus:border-spotify-green focus:outline-none"
                    required
                    minLength={3}
                  />
                </div>

                <div>
                  <label className="text-spotify-lightgray mb-2 font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black text-white px-4 py-3 rounded-lg border border-spotify-gray focus:border-spotify-green focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-spotify-green text-black px-6 py-3 rounded-full hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-lg"
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-spotify-gray space-y-3">
                <button
                  onClick={() => navigate('/change-password')}
                  className="w-full bg-spotify-gray text-white px-6 py-3 rounded-full hover:bg-spotify-gray/80 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Key className="w-5 h-5" />
                  Redefinir Senha
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="w-full bg-red-600/20 text-red-500 border border-red-500 px-6 py-3 rounded-full hover:bg-red-600/40 transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                  Deletar Conta Permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};
