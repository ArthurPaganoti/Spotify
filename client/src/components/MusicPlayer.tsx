import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface MusicPlayerProps {
  videoId: string | null;
  musicName: string;
  bandName: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const PREVIEW_DURATION = 30;

const MusicPlayer: React.FC<MusicPlayerProps> = ({ videoId, musicName, bandName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsReady(true);
      };
    } else {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Reset when video changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 text-center text-gray-400">
        <p>Vídeo não disponível para esta música</p>
      </div>
    );
  }

  const handlePlay = () => {
    if (!isReady || !window.YT) {
      toast('Player ainda está carregando. Aguarde um momento.', { icon: '⏳' });
      return;
    }

    if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
      startTimer();
      return;
    }

    const playerContainer = document.createElement('div');
    playerContainer.id = `youtube-player-${videoId}`;
    playerContainer.style.display = 'none';
    containerRef.current?.appendChild(playerContainer);

    playerRef.current = new window.YT.Player(playerContainer.id, {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        start: 30,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
      },
      events: {
        onReady: (event: any) => {
          event.target.playVideo();
          setIsPlaying(true);
          startTimer();
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            handleStop();
          }
        },
      },
    });
  };

  const startTimer = () => {
    setCurrentTime(0);

    timerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= PREVIEW_DURATION) {
          handleStop();
          return PREVIEW_DURATION;
        }
        return prev + 1;
      });
    }, 1000);

    // Auto-stop after preview duration
    setTimeout(() => {
      handleStop();
    }, PREVIEW_DURATION * 1000);
  };

  const handleStop = () => {
    if (playerRef.current && playerRef.current.stopVideo) {
      playerRef.current.stopVideo();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="music-player">
      <div ref={containerRef} style={{ display: 'none' }} />

      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-full transition-all transform hover:scale-105"
          title={`Tocar preview de ${musicName} - ${bandName}`}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Tocar Preview ({PREVIEW_DURATION}s)
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700">
          <button
            onClick={handleStop}
            className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
            aria-label="Parar"
            title="Parar preview"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Tocando preview...</span>
              <span className="text-xs text-gray-400">
                {formatTime(currentTime)} / {formatTime(PREVIEW_DURATION)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / PREVIEW_DURATION) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
