import React from 'react';
import { useGameStore } from '../../store/gameStore';
import PlayingCard from '../ui/PlayingCard';

const PlayerCards: React.FC = () => {
  const { gameBoardState: { arrangedCards } } = useGameStore();

  // Split cards into two groups for mobile view
  const firstRowCards = arrangedCards.slice(0, 4);
  const secondRowCards = arrangedCards.slice(4);

  return (
    <div className="w-full px-2">
      {/* Mobile view (two rows) */}
      <div className="md:hidden">
        <div className="flex justify-center gap-1 mb-1">
          {firstRowCards.map((card, index) => (
            <div key={`${card?.id || index}-mobile-1`} className="w-[14%] min-w-[40px] max-w-[60px]">
              <PlayingCard
                suit={card?.suit}
                rank={card?.rank}
                position={index + 1}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1">
          {secondRowCards.map((card, index) => (
            <div key={`${card?.id || index}-mobile-2`} className="w-[14%] min-w-[40px] max-w-[60px]">
              <PlayingCard
                suit={card?.suit}
                rank={card?.rank}
                position={index + 5}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop view (single row) */}
      <div className="hidden md:flex justify-center gap-2">
        {arrangedCards.map((card, index) => (
          <div key={`${card?.id || index}-desktop`} className="w-[12%] max-w-[80px]">
            <PlayingCard
              suit={card?.suit}
              rank={card?.rank}
              position={index + 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerCards; 