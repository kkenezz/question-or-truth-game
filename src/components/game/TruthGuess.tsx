import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import Button from '../ui/Button';
import { socketService } from '../../services/socketService';

const VALID_CARDS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

const TruthGuess: React.FC = () => {
  const [guess, setGuess] = useState<string>('');
  const { 
    roomCode,
    gameBoardState: { selectedAction, truthGuessResult },
    isHost,
    lastWinner
  } = useGameStore();

  // Debug logging
  useEffect(() => {
    console.log('TruthGuess component state:', {
      selectedAction,
      truthGuessResult,
      isHost,
      lastWinner,
      isWinner: (isHost && lastWinner === 'host') || (!isHost && lastWinner === 'guest')
    });
  }, [selectedAction, truthGuessResult, isHost, lastWinner]);

  const isWinner = (isHost && lastWinner === 'host') || (!isHost && lastWinner === 'guest');

  // Early return with debug log
  if (selectedAction !== 'truth' || !isWinner) {
    console.log('TruthGuess not showing because:', {
      selectedAction,
      isWinner,
      condition: selectedAction !== 'truth' ? 'action not truth' : 'not winner'
    });
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Only allow valid card values and limit to 8 characters
    if (value.length <= 8 && value.split('').every(char => VALID_CARDS.includes(char))) {
      setGuess(value);
    }
  };

  const handleSubmitGuess = () => {
    if (guess.length === 8) {
      console.log('Submitting guess:', guess);
      socketService.submitTruthGuess(roomCode, guess);
    }
  };

  // Debug log before rendering
  console.log('TruthGuess rendering with result:', truthGuessResult);

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 mt-4">
      <h3 className="font-medium mb-4">Guess Opponent's Card Arrangement</h3>
      {truthGuessResult ? (
        <div className={`p-4 rounded-lg ${truthGuessResult.correct ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
          <p className="font-medium mb-2">
            {truthGuessResult.correct 
              ? 'Correct! You won!' 
              : 'Wrong guess!'}
          </p>
          {!truthGuessResult.correct && truthGuessResult.actualArrangement && (
            <p className="text-sm text-gray-300">
              The correct arrangement was: <span className="font-mono">{truthGuessResult.actualArrangement}</span>
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Starting new round in a moment...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">
              Enter 8 cards in order (A=Ace, T=10, J=Jack, Q=Queen, K=King)
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={guess}
                onChange={handleInputChange}
                placeholder="e.g., A5689TJK"
                className="bg-gray-800 rounded px-3 py-2 w-32 text-center uppercase"
                maxLength={8}
              />
              <Button
                onClick={handleSubmitGuess}
                disabled={guess.length !== 8}
                variant="primary"
              >
                Submit Guess
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            * Only values matter, suits are irrelevant
          </div>
        </div>
      )}
    </div>
  );
};

export default TruthGuess; 