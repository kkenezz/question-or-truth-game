export interface CardType {
  id: string;
  suit: string;
  rank: string;
  value: number;
}

// New types for game state
export type GamePhase = 'bidding' | 'action';
export type ActionType = 'question' | 'truth' | null;
export type GameResult = 'ongoing' | 'won' | 'lost';

export interface RevealedCard {
  position: number;
  value: number;
}

export interface GameBoardState {
  // Token Management
  playerTokens: number;
  opponentTokens: number;
  currentBid: {
    player: number | null;
    opponent: number | null;
  };
  bidAmount: number;  // Current bid amount
  
  // Round Management
  roundNumber: number;
  timeRemaining: number;
  currentPhase: GamePhase;
  
  // Action Management
  currentTurn: 'player' | 'opponent' | null;
  selectedAction: ActionType;
  actionInProgress: boolean;
  
  // Game Progress
  revealedCards: RevealedCard[];
  gameResult: GameResult;

  // Player Cards
  arrangedCards: CardType[];
}