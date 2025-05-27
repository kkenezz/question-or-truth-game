import React from 'react';
import { HelpCircle, Eye } from 'lucide-react';
import Button from '../ui/Button';
import { useGameStore } from '../../store/gameStore';
import { socketService } from '../../services/socketService';
import { type ActionType } from '../../types/game';

const ActionArea: React.FC = () => {
  const { 
    gameBoardState: { 
      currentPhase,
      currentTurn,
      selectedAction
    },
    roomCode
  } = useGameStore();

  const isPlayerTurn = currentTurn === 'player';

  const handleActionSelect = (action: ActionType) => {
    if (!isPlayerTurn || currentPhase !== 'action') return;
    socketService.selectAction(roomCode, action);
  };

  if (currentPhase !== 'action') {
    return (
      <div className="bg-gray-700/30 rounded-lg p-4">
        <div className="text-center text-gray-400">
          Bidding in progress...
        </div>
      </div>
    );
  }

  if (!isPlayerTurn) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-4">
        <div className="text-center text-gray-400">
          Opponent's turn...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
      <h3 className="font-medium mb-4">Choose Your Action</h3>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={selectedAction === 'question' ? 'primary' : 'secondary'}
          onClick={() => handleActionSelect('question')}
          disabled={selectedAction !== null}
          className="flex items-center justify-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          Question
        </Button>

        <Button
          variant={selectedAction === 'truth' ? 'primary' : 'secondary'}
          onClick={() => handleActionSelect('truth')}
          disabled={selectedAction !== null}
          className="flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Truth
        </Button>
      </div>

      {selectedAction && (
        <div className="text-center text-sm text-gray-400">
          {selectedAction === 'question' 
            ? 'Select a question to ask...'
            : 'Make your guess...'}
        </div>
      )}
    </div>
  );
};

export default ActionArea; 