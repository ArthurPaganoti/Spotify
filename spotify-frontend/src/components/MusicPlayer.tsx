import React, { useState } from 'react';

interface MusicPlayerProps {
  videoId: string | null;
  musicName: string;
  bandName: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ videoId, musicName, bandName }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoId) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
        <p>Vídeo não disponível para esta música</p>
      </div>
    );
  }

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
  };

  return (
    <div className="music-player">
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Tocar Preview (15s)
        </button>
      ) : (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-colors"
            aria-label="Fechar player"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}?start=30&autoplay=1&rel=0`}
            title={`${musicName} - ${bandName}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;

