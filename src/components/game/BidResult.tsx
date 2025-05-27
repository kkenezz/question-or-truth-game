import React from 'react';
import { useGameStore } from '../../store/gameStore';
import Button from '../ui/Button';
import { socketService } from '../../services/socketService';

const BidResult: React.FC = () => {
  const { 
    roomCode,
    gameBoardState: { 
      currentPhase,
      selectedAction
    },
    isHost,
    lastWinner
  } = useGameStore();

  if (currentPhase !== 'action' || !lastWinner) {
    return null;
  }

  const isWinner = (isHost && lastWinner === 'host') || (!isHost && lastWinner === 'guest');
  const canFinishAction = selectedAction === 'question';

  const handleFinishAction = () => {
    socketService.startNewRound(roomCode);
  };

  return (
    <div className={`
      rounded-lg p-4 mb-4
      ${isWinner ? 'bg-green-500/20' : 'bg-red-500/20'}
    `}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-lg mb-2">
            {isWinner ? 'You won the bid!' : 'You lost the bid'}
          </h3>
          {isWinner ? (
            <p className="text-green-400">
              {!selectedAction 
                ? 'You can select to ask a question or the truth'
                : selectedAction === 'question'
                  ? 'Ask your question to the opponent'
                  : 'You can see the truth card'
              }
            </p>
          ) : (
            <p className="text-gray-400">
              {!selectedAction
                ? 'Wait for opponent to select question or truth'
                : selectedAction === 'question'
                  ? 'Wait for opponent\'s question'
                  : 'Wait for opponent to check the truth card'
              }
            </p>
          )}
        </div>
        {isWinner && canFinishAction && (
          <Button
            onClick={handleFinishAction}
            variant="primary"
          >
            Finish Question & Start New Round
          </Button>
        )}
      </div>
    </div>
  );
};

export default BidResult; 