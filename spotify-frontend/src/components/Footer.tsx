import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-spotify-gray py-4 px-6 mt-auto">
      <div className="text-center text-spotify-lightgray text-sm">
        © 2025 - Todos os direitos reservados{' '}
        <a
          href="https://github.com/StudiosWild"
          target="_blank"
          rel="noopener noreferrer"
          className="text-spotify-green hover:underline"
        >
          @StudiosWild
        </a>
      </div>
      <div className="text-center text-spotify-lightgray text-xs mt-2 opacity-100">
        Desenvolvido por{' '}
        <a
          href="https://github.com/ArthurPaganoti"
          target="_blank"
          rel="noopener noreferrer"
          className="text-spotify-green hover:underline transition-colors"
        >
          @Art.
        </a>
      </div>
    </footer>
  );
};
