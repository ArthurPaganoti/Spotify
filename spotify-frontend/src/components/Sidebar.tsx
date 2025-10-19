import React from 'react';
import { Home, Search, Library, Plus, Heart, LogOut, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCollaboratorInvites } from '../hooks/useCollaboratorInvites';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { data: invites } = useCollaboratorInvites();

  const menuItems = [
    { icon: Home, label: 'Início', path: '/home' },
    { icon: Search, label: 'Buscar', path: '/search' },
    { icon: Library, label: 'Sua Biblioteca', path: '/library' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const pendingInvitesCount = invites?.length || 0;

  return (
    <div className="bg-black w-64 h-full flex flex-col p-6">
      <div className="mb-8">
        <h1 className="text-spotify-green text-3xl font-bold flex items-center gap-2">
          <img src="/papagaio-icon.png" alt="Wild Music" className="w-10 h-10 rounded-full object-cover" />
          Wild Music
        </h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-spotify-gray text-white'
                    : 'text-spotify-lightgray hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="font-semibold">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-8 border-t border-spotify-gray">
          <button
            onClick={() => navigate('/add-music')}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-md transition-colors ${
              isActive('/add-music')
                ? 'bg-spotify-gray text-white'
                : 'text-spotify-lightgray hover:text-white'
            }`}
          >
            <Plus className="w-6 h-6 !text-inherit" />
            <span className="font-semibold">Adicionar Música</span>
          </button>
          <button
            onClick={() => navigate('/liked-musics')}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-md transition-colors ${
              isActive('/liked-musics')
                ? 'bg-spotify-gray text-white'
                : 'text-spotify-lightgray hover:text-white'
            }`}
          >
            <Heart className="w-6 h-6 !text-inherit" />
            <span className="font-semibold">Músicas Curtidas</span>
          </button>
          <button
            onClick={() => navigate('/collaborator-invites')}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-md transition-colors relative ${
              isActive('/collaborator-invites')
                ? 'bg-spotify-gray text-white'
                : 'text-spotify-lightgray hover:text-white'
            }`}
          >
            <Mail className="w-6 h-6 !text-inherit" />
            <span className="font-semibold">Convites</span>
            {pendingInvitesCount > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingInvitesCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="pt-4 border-t border-spotify-gray">
        <button
          onClick={logout}
          className="flex items-center gap-4 w-full px-4 py-3 text-spotify-lightgray hover:text-white transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="font-semibold">Sair</span>
        </button>
      </div>
    </div>
  );
};
