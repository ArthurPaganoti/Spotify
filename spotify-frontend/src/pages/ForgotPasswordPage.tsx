import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setSuccess('Email enviado com sucesso! Verifique sua caixa de entrada.');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-darkgray to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-12 h-12 text-spotify-green" />
            <h1 className="text-spotify-green text-4xl font-bold">Spotify</h1>
          </div>
          <h2 className="text-white text-2xl font-bold">Recuperar Senha</h2>
          <p className="text-spotify-lightgray mt-2">
            Digite seu email para receber um código de recuperação
          </p>
        </div>

        <div className="bg-spotify-gray rounded-lg p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-500 px-4 py-3 rounded-md mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-white font-semibold mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-spotify-lightgray w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-spotify-darkgray text-white pl-12 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-spotify-lightgray hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
            
            {success && (
              <Link
                to="/reset-password"
                className="block text-center text-spotify-green hover:underline font-semibold"
              >
                Já tenho o código - Redefinir senha
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

