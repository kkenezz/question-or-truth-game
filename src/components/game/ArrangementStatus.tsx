import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const ArrangementStatus: React.FC = () => {
  const { 
    playerName,
    opponentName,
    cardsArranged,
    opponentCardsArranged
  } = useGameStore();

  return (
    <div className="bg-gray-700/30 rounded-lg p-4">
      <h3 className="font-medium mb-2">Card Arrangement Status</h3>
      
      <div className="space-y-3">
        {/* Current player status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span>{playerName} (You)</span>
          </div>
          {cardsArranged ? (
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </span>
          ) : (
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Arranging
            </span>
          )}
        </div>
        
        {/* Opponent status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span>{opponentName}</span>
          </div>
          {opponentCardsArranged ? (
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </span>
          ) : (
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Arranging
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArrangementStatus; 