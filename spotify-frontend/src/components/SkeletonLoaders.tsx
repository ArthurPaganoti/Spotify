import React from 'react';

export const MusicCardSkeleton: React.FC = () => {
  return (
    <div className="bg-spotify-darkgray rounded-lg p-4 border border-gray-700 animate-pulse">
      <div className="flex gap-4">
        {/* Image skeleton */}
        <div className="w-24 h-24 bg-gray-700 rounded-lg flex-shrink-0" />
        
        {/* Content skeleton */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Title */}
            <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
            {/* Band */}
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
            {/* Genre */}
            <div className="h-3 bg-gray-700 rounded w-1/3" />
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <div className="h-9 bg-gray-700 rounded-full w-24" />
            <div className="h-9 bg-gray-700 rounded-full w-9" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const MusicGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <MusicCardSkeleton key={index} />
      ))}
    </div>
  );
};

