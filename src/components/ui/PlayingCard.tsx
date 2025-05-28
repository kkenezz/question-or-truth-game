import React from 'react';

interface PlayingCardProps {
  suit?: string;
  rank?: string;
  position: number;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ suit, rank, position }) => {
  const isRedSuit = suit === '♥' || suit === '♦';

  return (
    <div
      className={`
        aspect-[3/4] w-full rounded-lg
        bg-gray-800 border border-gray-600
        flex flex-col items-center justify-center
        transition-transform hover:scale-105
      `}
    >
      <div className={`text-lg font-medium ${isRedSuit ? 'text-red-500' : ''}`}>
        {rank}
      </div>
      <div className={`text-2xl ${isRedSuit ? 'text-red-500' : ''}`}>
        {suit}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {position}
      </div>
    </div>
  );
};

export default PlayingCard; 