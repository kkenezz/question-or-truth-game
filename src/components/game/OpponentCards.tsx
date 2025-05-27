import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { type RevealedCard } from '../../types/game';

const OpponentCards: React.FC = () => {
  const { gameBoardState: { revealedCards } } = useGameStore();

  // Create an array of 8 positions
  const positions = Array(8).fill(null).map((_, index) => ({
    position: index + 1,
    revealed: revealedCards.find(card => card.position === index + 1)
  }));

  return (
    <div className="bg-gray-700/30 rounded-lg p-4">
      <h3 className="font-medium mb-4">Opponent's Cards</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {positions.map(({ position, revealed }) => (
          <div
            key={position}
            className={`
              flex-shrink-0 w-14 aspect-[3/4] rounded-lg
              ${revealed 
                ? 'bg-gray-800 border-2 border-purple-500' 
                : 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600'}
              flex flex-col items-center justify-center
              transition-transform hover:scale-105
            `}
          >
            {revealed ? (
              <>
                <div className="text-lg font-medium text-purple-400">
                  {revealed.value}
                </div>
                <div className="text-xs text-purple-400 mt-1">
                  Revealed
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">
                {position}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpponentCards; 