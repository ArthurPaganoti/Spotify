import React from 'react';
import { Home, Search, Library, Plus, Heart, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Início', path: '/home' },
    { icon: Search, label: 'Buscar', path: '/search' },
    { icon: Library, label: 'Sua Biblioteca', path: '/library' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
            className="flex items-center gap-4 w-full px-4 py-3 text-spotify-lightgray hover:text-white transition-colors group rounded-md"
          >
            <Heart className="w-6 h-6 !text-inherit" />
            <span className="font-semibold">Músicas Curtidas</span>
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
