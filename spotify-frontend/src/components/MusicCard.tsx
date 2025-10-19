import React, { useState } from 'react';
import { Music, Trash2, User, Calendar, Edit, Heart } from 'lucide-react';
import { MusicResponseDTO } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { likeService } from '../services/likeService';
import toast from 'react-hot-toast';
import MusicPlayer from './MusicPlayer';

interface MusicCardProps {
  music: MusicResponseDTO;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  onLikeChange?: () => void | Promise<void>;
}

export const MusicCard: React.FC<MusicCardProps> = ({ music, onDelete, canDelete = false, onLikeChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);

    const wasLiked = music.isLiked;

    try {
      await likeService.toggleLike(music.id);

      if (onLikeChange) {
        await onLikeChange();
      }

      if (!wasLiked) {
        toast.success(`💜 ${music.name} adicionada às curtidas!`, {
          style: {
            background: '#8b5cf6',
            color: '#fff',
          },
        });
      } else {
        toast(`🤍 ${music.name} removida das curtidas`, {
          icon: '👋',
        });
      }
    } catch (error: any) {
      console.error('Erro ao curtir música:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao curtir música. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsLiking(false);
    }
  };

  const isCreator = user && music.createdByUserId && user.id === music.createdByUserId;
  const isOrphanedMusic = music.createdByUserId === null;

  return (
    <div className="bg-spotify-gray rounded-lg p-4 hover:bg-spotify-gray/80 transition-all group animate-fadeIn">
      <div className="flex items-start gap-4">
        {/* Capa da música ou ícone padrão */}
        <div className="flex-shrink-0">
          {music.imageUrl ? (
            <img
              src={music.imageUrl}
              alt={`Capa de ${music.name}`}
              className="w-20 h-20 rounded-md object-cover shadow-lg"
            />
          ) : (
            <div className="bg-spotify-darkgray rounded-md p-4 w-20 h-20 flex items-center justify-center">
              <Music className="w-12 h-12 text-spotify-green" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate mb-1">{music.name}</h3>
          <p className="text-spotify-lightgray text-sm truncate mb-2">{music.band}</p>
          <div className="flex items-center gap-4 text-xs text-spotify-lightgray">
            <span className="bg-spotify-darkgray px-2 py-1 rounded-full">{music.genre}</span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className={isOrphanedMusic ? 'italic text-red-400' : ''}>
                {music.createdByUserName}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(music.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {/* Like button - always visible, with purple heart when liked */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`p-2 rounded-full transition-all ${
              music.isLiked 
                ? 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30' 
                : 'hover:bg-spotify-green/20 text-spotify-lightgray hover:text-spotify-green'
            } disabled:opacity-50`}
            title={music.isLiked ? 'Remover curtida' : 'Curtir música'}
          >
            <Heart
              className={`w-5 h-5 ${music.isLiked ? 'fill-current' : ''}`}
            />
          </button>

          {/* Only show edit/delete buttons if user is the creator and music is not orphaned */}
          {canDelete && isCreator && !isOrphanedMusic && (
            <>
              <button
                onClick={() => navigate(`/edit-music/${music.id}`)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-spotify-green/20 rounded-full"
                title="Editar música"
              >
                <Edit className="w-5 h-5 text-spotify-green" />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(music.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-full"
                  title="Deletar música"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* YouTube Player Section */}
      {music.youtubeVideoId && (
        <div className="mt-4 pt-4 border-t border-spotify-darkgray">
          <MusicPlayer
            videoId={music.youtubeVideoId}
            musicName={music.name}
            bandName={music.band}
          />
        </div>
      )}
    </div>
  );
};
