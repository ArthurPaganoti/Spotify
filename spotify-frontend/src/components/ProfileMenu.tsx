import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Key, LogOut, Camera, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-black/40 hover:bg-black/60 rounded-full px-2 py-1 transition-all group"
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-spotify-green"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center text-black font-bold">
            {user ? getInitials(user.name) : <User className="w-6 h-6" />}
          </div>
        )}
        <div className="text-left hidden md:block">
          <p className="text-white text-sm font-semibold group-hover:text-spotify-green transition-colors">
            {user?.name || 'Usuário'}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-spotify-darkgray rounded-lg shadow-xl border border-spotify-gray overflow-hidden z-50">
          <div className="p-4 bg-gradient-to-r from-spotify-green/20 to-purple-600/20 border-b border-spotify-gray">
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-spotify-green"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center text-black font-bold text-lg">
                  {user ? getInitials(user.name) : <User className="w-6 h-6" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{user?.name}</p>
                <p className="text-spotify-lightgray text-sm truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-spotify-gray transition-colors"
            >
              <Settings className="w-5 h-5 text-spotify-green" />
              <span>Editar Perfil</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/profile/change-password');
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-spotify-gray transition-colors"
            >
              <Key className="w-5 h-5 text-spotify-green" />
              <span>Redefinir Senha</span>
            </button>
          </div>

          <div className="border-t border-spotify-gray">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-spotify-gray transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

