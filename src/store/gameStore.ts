import { create } from 'zustand';
import { type GameBoardState, type GamePhase, type ActionType, type GameResult } from '../types/game';

interface GameState {
  // Connection state
  isConnected: boolean;
  socketId: string | null;
  
  // Player info
  playerName: string;
  isHost: boolean;
  
  // Room info
  inRoom: boolean;
  roomCode: string;
  opponentName: string | null;
  opponentReady: boolean;
  isPlayerReady: boolean;
  
  // Game state
  gameStarted: boolean;
  cardsArranged: boolean;
  opponentCardsArranged: boolean;
  
  // Game board state
  gameBoardState: GameBoardState & {
    truthGuessResult?: {
      correct: boolean;
      actualArrangement?: string;
    };
  };
  
  // Bidding state
  hostBidSubmitted: boolean;
  guestBidSubmitted: boolean;
  lastBidAmount: number | null;
  lastWinner: 'host' | 'guest' | null;
  
  // Actions
  setPlayerName: (name: string) => void;
  setRoomInfo: (data: {
    roomCode: string;
    isHost: boolean;
    playerName: string;
    hostName?: string;
  }) => void;
  setOpponentInfo: (data: { playerName: string }) => void;
  setConnectionStatus: (connected: boolean, socketId?: string) => void;
  setOpponentReady: (isReady: boolean) => void;
  setPlayerReady: (isReady: boolean) => void;
  setCardsArranged: (arranged: boolean) => void;
  setOpponentCardsArranged: (arranged: boolean) => void;
  startGame: () => void;
  resetRoom: () => void;
  resetAll: () => void;
  
  // New actions
  initializeGameBoard: () => void;
  updateTokens: (playerTokens: number, opponentTokens: number) => void;
  submitBid: (amount: number) => void;
  setCurrentPhase: (phase: GamePhase) => void;
  setTimeRemaining: (time: number) => void;
  setCurrentTurn: (turn: 'player' | 'opponent' | null) => void;
  setSelectedAction: (action: ActionType) => void;
  addRevealedCard: (position: number, value: number) => void;
  setGameResult: (result: GameResult) => void;
  setArrangedCards: (cards: CardType[]) => void;
  
  // Bidding actions
  setHostBidSubmitted: (submitted: boolean) => void;
  setGuestBidSubmitted: (submitted: boolean) => void;
  setLastBidAmount: (amount: number | null) => void;
  handleBidTie: (data: {
    hostBid: number;
    guestBid: number;
    hostTokens: number;
    guestTokens: number;
  }) => void;
  handleBidComplete: (data: {
    winner: 'host' | 'guest';
    hostBid: number;
    guestBid: number;
    hostTokens: number;
    guestTokens: number;
    currentPhase: GamePhase;
  }) => void;
  handleNewRound: (data: {
    roundNumber: number;
    hostTokens: number;
    guestTokens: number;
  }) => void;
  setLastWinner: (winner: 'host' | 'guest' | null) => void;
  handleGameWin: () => void;
  handleGameLose: () => void;
  setTruthGuessResult: (result: { correct: boolean; actualArrangement?: string; } | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  isConnected: false,
  socketId: null,
  playerName: '',
  isHost: false,
  inRoom: false,
  roomCode: '',
  opponentName: null,
  opponentReady: false,
  isPlayerReady: false,
  gameStarted: false,
  cardsArranged: false,
  opponentCardsArranged: false,
  
  // Game board state
  gameBoardState: {
    playerTokens: 10,
    opponentTokens: 10,
    currentBid: {
      player: null,
      opponent: null,
    },
    roundNumber: 1,
    timeRemaining: 30,
    currentPhase: 'bidding',
    currentTurn: null,
    selectedAction: null,
    actionInProgress: false,
    revealedCards: [],
    gameResult: 'ongoing',
    arrangedCards: [],
    truthGuessResult: undefined,
  },
  
  // Bidding state
  hostBidSubmitted: false,
  guestBidSubmitted: false,
  lastBidAmount: null,
  lastWinner: null,
  
  // Actions
  setPlayerName: (name) => set({ playerName: name }),
  
  setRoomInfo: (data) => set((state) => ({
    inRoom: true,
    roomCode: data.roomCode,
    isHost: data.isHost,
    playerName: data.playerName,
    opponentName: data.isHost ? null : data.hostName || null,
  })),
  
  setOpponentInfo: (data) => set({
    opponentName: data.playerName
  }),
  
  setConnectionStatus: (connected, socketId = null) => set({
    isConnected: connected,
    socketId: socketId || null
  }),
  
  setOpponentReady: (isReady) => set({
    opponentReady: isReady
  }),
  
  setPlayerReady: (isReady) => set({
    isPlayerReady: isReady
  }),

  setCardsArranged: (arranged) => set({
    cardsArranged: arranged
  }),

  setOpponentCardsArranged: (arranged) => set({
    opponentCardsArranged: arranged
  }),
  
  startGame: () => set({
    gameStarted: true,
    cardsArranged: false,
    opponentCardsArranged: false
  }),
  
  resetRoom: () => set({
    inRoom: false,
    roomCode: '',
    isHost: false,
    opponentName: null,
    opponentReady: false,
    isPlayerReady: false,
    gameStarted: false,
    cardsArranged: false,
    opponentCardsArranged: false
  }),
  
  resetAll: () => set({
    isConnected: false,
    socketId: null,
    playerName: '',
    inRoom: false,
    roomCode: '',
    isHost: false,
    opponentName: null,
    opponentReady: false,
    isPlayerReady: false,
    gameStarted: false,
    cardsArranged: false,
    opponentCardsArranged: false
  }),
  
  // New actions
  initializeGameBoard: () => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      playerTokens: 10,
      opponentTokens: 10,
      roundNumber: 1,
      currentPhase: 'bidding',
      currentTurn: null,
      selectedAction: null,
      actionInProgress: false,
      revealedCards: [],
      gameResult: 'ongoing',
      arrangedCards: state.gameBoardState.arrangedCards,
    }
  })),

  updateTokens: (playerTokens, opponentTokens) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      playerTokens,
      opponentTokens,
    }
  })),

  submitBid: (amount) => set((state) => ({
    lastBidAmount: amount,
    hostBidSubmitted: state.isHost,
    guestBidSubmitted: !state.isHost
  })),

  setCurrentPhase: (phase) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      currentPhase: phase,
    }
  })),

  setTimeRemaining: (time) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      timeRemaining: time,
    }
  })),

  setCurrentTurn: (turn) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      currentTurn: turn,
    }
  })),

  setSelectedAction: (action) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      selectedAction: action,
    }
  })),

  addRevealedCard: (position, value) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      revealedCards: [...state.gameBoardState.revealedCards, { position, value }],
    }
  })),

  setGameResult: (result) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      gameResult: result,
    }
  })),

  setArrangedCards: (cards) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      arrangedCards: cards,
    }
  })),
  
  // Bidding actions
  setHostBidSubmitted: (submitted) => set({ hostBidSubmitted: submitted }),
  
  setGuestBidSubmitted: (submitted) => set({ guestBidSubmitted: submitted }),
  
  setLastBidAmount: (amount) => set({ lastBidAmount: amount }),
  
  handleBidTie: (data) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      playerTokens: state.isHost ? data.hostTokens : data.guestTokens,
      opponentTokens: state.isHost ? data.guestTokens : data.hostTokens,
      currentBid: {
        player: null,
        opponent: null
      }
    },
    hostBidSubmitted: false,
    guestBidSubmitted: false,
    lastBidAmount: null
  })),
  
  handleBidComplete: (data) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      playerTokens: state.isHost ? data.hostTokens : data.guestTokens,
      opponentTokens: state.isHost ? data.guestTokens : data.hostTokens,
      currentPhase: data.currentPhase,
      currentTurn: data.winner === (state.isHost ? 'host' : 'guest') ? 'player' : 'opponent'
    },
    hostBidSubmitted: false,
    guestBidSubmitted: false,
    lastBidAmount: null,
    lastWinner: data.winner
  })),
  
  handleNewRound: (data) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      roundNumber: data.roundNumber,
      playerTokens: state.isHost ? data.hostTokens : data.guestTokens,
      opponentTokens: state.isHost ? data.guestTokens : data.hostTokens,
      currentPhase: 'bidding',
      currentBid: {
        player: null,
        opponent: null
      },
      selectedAction: null,
      truthGuessResult: undefined,
    },
    hostBidSubmitted: false,
    guestBidSubmitted: false,
    lastBidAmount: null,
    lastWinner: null
  })),

  setLastWinner: (winner) => set({ lastWinner: winner }),

  handleGameWin: () => {
    set((state) => ({
      gameBoardState: {
        ...state.gameBoardState,
        gameStatus: 'win',
        truthGuessResult: {
          correct: true,
          actualArrangement: undefined,
        }
      }
    }));
  },

  handleGameLose: () => {
    set((state) => ({
      gameBoardState: {
        ...state.gameBoardState,
        gameStatus: 'lose',
        truthGuessResult: {
          correct: false,
          actualArrangement: state.gameBoardState.truthGuessResult?.actualArrangement,
        }
      }
    }));
  },

  setTruthGuessResult: (result) => set((state) => ({
    gameBoardState: {
      ...state.gameBoardState,
      truthGuessResult: result || undefined,
    }
  })),
}));