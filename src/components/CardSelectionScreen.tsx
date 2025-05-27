import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Card from './ui/Card';
import Button from './ui/Button';
import CardMatrix from './game/CardMatrix';
import CardRostrum from './game/CardRostrum';
import ArrangementStatus from './game/ArrangementStatus';
import { type CardType } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socketService';

const CardSelectionScreen: React.FC = () => {
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [rostrumCards, setRostrumCards] = useState<CardType[]>([]);
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);
  const { 
    roomCode, 
    cardsArranged, 
    opponentCardsArranged,
    initializeGameBoard,
    setArrangedCards 
  } = useGameStore();

  const handleCardSelect = (card: CardType) => {
    if (selectedCards.some(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else if (selectedCards.length < 8) {
      setSelectedCards([...selectedCards, card]);
    } else {
      toast.warning('You can only select 8 cards');
    }
  };

  const handleSelectionComplete = () => {
    if (selectedCards.length === 8) {
      setIsSelectionComplete(true);
      setRostrumCards(selectedCards);
    } else {
      toast.error('Please select exactly 8 cards');
    }
  };

  const validateRostrumArrangement = (cards: CardType[]): boolean => {
    // Group cards by suit
    const suitGroups = cards.reduce((acc, card) => {
      if (!acc[card.suit]) acc[card.suit] = [];
      acc[card.suit].push(card);
      return acc;
    }, {} as Record<string, CardType[]>);

    // Check each suit group for ascending order
    return Object.values(suitGroups).every(suitCards => {
      if (suitCards.length <= 1) return true;
      
      for (let i = 0; i < suitCards.length - 1; i++) {
        const current = suitCards[i].value;
        const next = suitCards[i + 1].value;
        if (current >= next) return false;
      }
      return true;
    });
  };

  const handleConfirmArrangement = () => {
    if (!validateRostrumArrangement(rostrumCards)) {
      toast.error('Cards of the same suit must be arranged in ascending order');
      return;
    }
    
    // Save arranged cards to game state
    setArrangedCards(rostrumCards);
    
    // Send arrangement status to server
    socketService.setCardsArranged(roomCode, true);
    socketService.saveArrangedCards(roomCode, rostrumCards);
    toast.success('Card arrangement confirmed!');
  };

  // Check if both players have arranged their cards
  React.useEffect(() => {
    if (cardsArranged && opponentCardsArranged) {
      toast.success('Both players are ready! Starting game...');
      // Initialize game board state
      initializeGameBoard();
    }
  }, [cardsArranged, opponentCardsArranged, initializeGameBoard]);

  return (
    <Card className="bg-gray-800/50 backdrop-blur-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {isSelectionComplete ? 'Arrange Your Cards' : 'Select Your Cards'}
        </h2>
        <p className="text-gray-400">
          {isSelectionComplete 
            ? 'Drag to arrange cards. Same suit must be in ascending order.'
            : `${selectedCards.length}/8 cards selected`}
        </p>
      </div>

      {/* Add ArrangementStatus component */}
      <div className="mb-6">
        <ArrangementStatus />
      </div>

      {isSelectionComplete ? (
        <div className="space-y-6">
          <CardRostrum
            cards={rostrumCards}
            setCards={setRostrumCards}
          />
          <div className="flex justify-between gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsSelectionComplete(false);
                socketService.setCardsArranged(roomCode, false);
              }}
            >
              Back to Selection
            </Button>
            <Button
              onClick={handleConfirmArrangement}
              disabled={rostrumCards.length !== 8 || cardsArranged}
            >
              {cardsArranged ? 'Arrangement Confirmed' : 'Confirm Arrangement'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <CardMatrix
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
          />
          <Button
            onClick={handleSelectionComplete}
            disabled={selectedCards.length !== 8}
            fullWidth
          >
            Continue to Arrangement
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CardSelectionScreen;