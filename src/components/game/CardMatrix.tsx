import React from 'react';
import { type CardType } from '../../types/game';

interface CardMatrixProps {
  selectedCards: CardType[];
  onCardSelect: (card: CardType) => void;
}

const CardMatrix: React.FC<CardMatrixProps> = ({ selectedCards, onCardSelect }) => {
  const suits = ['♠', '♥', '♦', '♣'] as const;
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const isCardSelected = (suit: string, rank: string) => {
    return selectedCards.some(card => card.suit === suit && card.rank === rank);
  };

  const getValue = (rank: string): number => {
    if (rank === 'A') return 1;
    if (rank === 'J') return 11;
    if (rank === 'Q') return 12;
    if (rank === 'K') return 13;
    return parseInt(rank);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2"></th>
            {ranks.map(rank => (
              <th key={rank} className="p-2 text-center text-gray-400 text-sm">
                {rank}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {suits.map(suit => (
            <tr key={suit}>
              <td className="p-2 text-2xl text-center">
                <span className={suit === '♥' || suit === '♦' ? 'text-red-500' : ''}>
                  {suit}
                </span>
              </td>
              {ranks.map(rank => {
                const card: CardType = {
                  id: `${suit}${rank}`,
                  suit,
                  rank,
                  value: getValue(rank)
                };
                const selected = isCardSelected(suit, rank);

                return (
                  <td key={rank} className="p-1">
                    <button
                      onClick={() => onCardSelect(card)}
                      className={`w-full aspect-[3/4] rounded-lg border-2 transition-all transform hover:scale-105
                        ${selected 
                          ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50' 
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}
                    >
                      <div className={`text-lg font-medium ${suit === '♥' || suit === '♦' ? 'text-red-500' : ''}`}>
                        {rank}
                      </div>
                      <div className={`text-2xl ${suit === '♥' || suit === '♦' ? 'text-red-500' : ''}`}>
                        {suit}
                      </div>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CardMatrix;