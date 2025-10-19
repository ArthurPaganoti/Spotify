import React from 'react';
import { Music, Trash2, User, Calendar } from 'lucide-react';
import { MusicResponseDTO } from '../types';

interface MusicCardProps {
  music: MusicResponseDTO;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export const MusicCard: React.FC<MusicCardProps> = ({ music, onDelete, canDelete = false }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-spotify-gray rounded-lg p-4 hover:bg-spotify-gray/80 transition-all group animate-fadeIn">
      <div className="flex items-start gap-4">
        <div className="bg-spotify-darkgray rounded-md p-4 flex-shrink-0">
          <Music className="w-12 h-12 text-spotify-green" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate mb-1">{music.name}</h3>
          <p className="text-spotify-lightgray text-sm truncate mb-2">{music.band}</p>
          <div className="flex items-center gap-4 text-xs text-spotify-lightgray">
            <span className="bg-spotify-darkgray px-2 py-1 rounded-full">{music.genre}</span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {music.createdByUserName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(music.createdAt)}
            </span>
          </div>
        </div>

        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(music.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-full"
            title="Deletar música"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};
