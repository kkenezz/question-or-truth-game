import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { type CardType } from '../../types/game';

const PlayerCards: React.FC = () => {
  const { gameBoardState: { arrangedCards } } = useGameStore();

  return (
    <div className="bg-gray-700/30 rounded-lg p-4">
      <h3 className="font-medium mb-4">Your Cards</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {arrangedCards.map((card, index) => {
          const isRedSuit = card.suit === '♥' || card.suit === '♦';
          
          return (
            <div
              key={card.id}
              className={`
                flex-shrink-0 w-14 aspect-[3/4] rounded-lg
                bg-gray-800 border-2 border-gray-600
                flex flex-col items-center justify-center
                transition-transform hover:scale-105
              `}
            >
              <div className={`text-lg font-medium ${isRedSuit ? 'text-red-500' : ''}`}>
                {card.rank}
              </div>
              <div className={`text-2xl ${isRedSuit ? 'text-red-500' : ''}`}>
                {card.suit}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerCards; 