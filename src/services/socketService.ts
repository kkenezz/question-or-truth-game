/// <reference types="vite/client" />
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useGameStore } from '../store/gameStore';
import { type CardType, type ActionType } from '../types/game';

// Get the current hostname and port for dynamic connection URL
const getSocketUrl = () => {
  // Development environment
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // Production environment (Render)
  return import.meta.env.VITE_BACKEND_URL || 'https://question-or-truth-backend.onrender.com';
};

class SocketService {
  private socket: Socket | null = null;
  private initialized: boolean = false;
  private connectionAttempts: number = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private eventHandlers: { [key: string]: (...args: unknown[]) => void } = {};

  init() {
    if (this.initialized) {
      this.cleanup();  // Cleanup existing connection before reinitializing
    }
    
    try {
      const socketUrl = getSocketUrl();
      console.log('Connecting to socket URL:', socketUrl);

      this.socket = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        autoConnect: false,
        withCredentials: true,
        forceNew: true,
        path: '/socket.io'
      });
      
      this.initialized = true;
      
      // Store event handlers for cleanup
      this.eventHandlers = {
        connect: this.handleConnect.bind(this),
        disconnect: this.handleDisconnect.bind(this),
        'connect_error': this.handleConnectionError.bind(this),
        error: this.handleError.bind(this),
        'room-created': this.handleRoomCreated.bind(this),
        'room-joined': this.handleRoomJoined.bind(this),
        'player-joined': this.handlePlayerJoined.bind(this),
        'opponent-ready': this.handleOpponentReady.bind(this),
        'host-disconnected': this.handleHostDisconnected.bind(this),
        'guest-disconnected': this.handleGuestDisconnected.bind(this),
        'room-expired': this.handleRoomExpired.bind(this),
        'game-start': this.handleGameStart.bind(this),
        'cards-arranged': this.handleOpponentCardsArranged.bind(this)
      };

      // Register all event handlers
      Object.entries(this.eventHandlers).forEach(([event, handler]) => {
        this.socket?.on(event, handler);
      });

      // Add transport error logging
      this.socket.on('connect_error', (error) => {
        console.error('Socket connect_error:', error);
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Setup game-specific event listeners
      this.setupGameListeners();

      // Connect after setting up handlers
      this.socket.connect();
      
    } catch (error) {
      console.error('Socket initialization error:', error);
      toast.error('Failed to initialize connection');
      this.cleanup();
    }
  }

  private cleanup() {
    if (this.socket) {
      // Remove all event listeners
      Object.entries(this.eventHandlers).forEach(([event, handler]) => {
        this.socket?.off(event, handler);
      });
      
      // Clear reconnect timer if exists
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Close and cleanup socket
      this.socket.close();
      this.socket = null;
      this.initialized = false;
      this.connectionAttempts = 0;
    }
  }

  private reconnect() {
    if (this.connectionAttempts >= this.maxReconnectAttempts) {
      toast.error('Connection failed after multiple attempts. Please try again later.');
      this.cleanup();
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.connectionAttempts++;
    this.reconnectTimer = setTimeout(() => {
      if (!this.socket?.connected) {
        this.init();
      }
    }, 1000 * this.connectionAttempts); // Exponential backoff
  }

  createRoom(playerName: string) {
    if (!this.socket?.connected) {
      toast.warning('Connecting to server...');
      this.reconnect();
      setTimeout(() => {
        if (this.socket?.connected) {
          this.socket.emit('create-room', { playerName });
        } else {
          toast.error('Server connection failed. Please try again.');
        }
      }, 1000);
      return;
    }
    this.socket.emit('create-room', { playerName });
  }

  joinRoom(roomCode: string, playerName: string) {
    if (!this.socket?.connected) {
      toast.warning('Connecting to server...');
      this.reconnect();
      setTimeout(() => {
        if (this.socket?.connected) {
          this.socket.emit('join-room', { roomCode, playerName });
        } else {
          toast.error('Server connection failed. Please try again.');
        }
      }, 1000);
      return;
    }
    this.socket.emit('join-room', { roomCode, playerName });
  }

  setPlayerReady(roomCode: string, isReady: boolean) {
    if (!this.socket?.connected) {
      toast.warning('Reconnecting...');
      this.reconnect();
      return;
    }
    this.socket.emit('player-ready', { roomCode, isReady });
    useGameStore.getState().setPlayerReady(isReady);
  }

  startGame(roomCode: string) {
    if (!this.socket?.connected) {
      toast.warning('Reconnecting...');
      this.reconnect();
      return;
    }
    this.socket.emit('start-game', { roomCode });
  }

  setCardsArranged(roomCode: string, arranged: boolean) {
    if (!this.socket?.connected) {
      toast.warning('Reconnecting...');
      this.reconnect();
      return;
    }
    this.socket.emit('cards-arranged', { roomCode, arranged });
    useGameStore.getState().setCardsArranged(arranged);
  }

  saveArrangedCards(roomCode: string, cards: any[]) {
    if (!this.socket?.connected) {
      toast.warning('Reconnecting...');
      this.reconnect();
      return;
    }
    console.log('=== DEBUG: Saving arranged cards ===');
    console.log('Room code:', roomCode);
    console.log('Cards:', cards);
    this.socket.emit('save-arranged-cards', { roomCode, cards });
  }

  submitBid(roomCode: string, bid: number) {
    console.log('=== DEBUG submitBid ===');
    console.log('Socket connected:', this.socket?.connected);
    console.log('Socket ID:', this.socket?.id);
    console.log('Room code:', roomCode);
    console.log('Bid:', bid);
    
    if (!this.socket?.connected) {
      console.log('Socket not connected, attempting to reconnect...');
      toast.warning('Reconnecting...');
      this.reconnect();
      return;
    }
    
    console.log('Emitting submit_bid event...');
    this.socket.emit('submit_bid', { roomCode, bid });
    console.log('Event emitted successfully');
  }

  selectAction(roomCode: string, action: ActionType) {
    if (!this.socket?.connected) {
      toast.warning('Reconnecting...');
      this.reconnect();
      return;
    }
    this.socket.emit('select-action', { roomCode, action });
    useGameStore.getState().setSelectedAction(action);
  }

  startNewRound(roomCode: string) {
    if (!this.socket?.connected) {
      toast.warning('Reconnecting...');
      this.reconnect();
      return;
    }
    this.socket.emit('start_new_round', { roomCode });
  }

  submitTruthGuess(roomCode: string, guess: string) {
    if (!this.socket?.connected) {
      toast.warning('Reconnecting...');
      this.reconnect();
      return;
    }
    console.log('=== DEBUG: Submitting truth guess ===');
    console.log('Room code:', roomCode);
    console.log('Guess:', guess);
    this.socket.emit('submit_truth_guess', { roomCode, guess });
    
    // Add confirmation of event emission
    if (this.socket.hasListeners('truth_guess_result')) {
      console.log('truth_guess_result listener is registered');
    } else {
      console.warn('No listener found for truth_guess_result');
    }
  }

  private handleConnect() {
    this.connectionAttempts = 0;
    useGameStore.getState().setConnectionStatus(true, this.socket?.id || undefined);
    toast.success('Connected to server');
  }

  private handleDisconnect() {
    useGameStore.getState().setConnectionStatus(false);
    toast.warning('Disconnected from server. Attempting to reconnect...');
    this.reconnect();
  }

  private handleConnectionError(error: Error) {
    console.error('Connection error:', error);
    toast.error('Connection error. Retrying...');
    this.reconnect();
  }

  private handleError(error: { message: string }) {
    console.error('Socket error:', error);
    toast.error(error.message || 'An error occurred');
  }

  private handleRoomCreated(data: { roomCode: string; isHost: boolean; playerName: string }) {
    useGameStore.getState().setRoomInfo({
      roomCode: data.roomCode,
      isHost: data.isHost,
      playerName: data.playerName
    });
    toast.success(`Room created! Code: ${data.roomCode}`);
  }

  private handleRoomJoined(data: { roomCode: string; isHost: boolean; hostName: string; playerName: string }) {
    useGameStore.getState().setRoomInfo({
      roomCode: data.roomCode,
      isHost: data.isHost,
      playerName: data.playerName,
      hostName: data.hostName
    });
    toast.success(`Joined room ${data.roomCode}`);
  }

  private handlePlayerJoined(data: { playerName: string }) {
    useGameStore.getState().setOpponentInfo(data);
    toast.info(`${data.playerName} joined the room`);
  }

  private handleOpponentReady(data: { isReady: boolean }) {
    useGameStore.getState().setOpponentReady(data.isReady);
  }

  private handleGameStart() {
    useGameStore.getState().startGame();
    toast.success('Game is starting!');
  }

  private handleHostDisconnected() {
    toast.error('Host disconnected. Room closed.');
    useGameStore.getState().resetRoom();
  }

  private handleGuestDisconnected() {
    toast.info('Other player disconnected');
    useGameStore.getState().setOpponentInfo({ playerName: '' });
    useGameStore.getState().setOpponentReady(false);
  }

  private handleRoomExpired() {
    toast.error('Room expired due to inactivity');
    useGameStore.getState().resetRoom();
  }

  private handleOpponentCardsArranged(data: { arranged: boolean }) {
    useGameStore.getState().setOpponentCardsArranged(data.arranged);
    
    const store = useGameStore.getState();
    if (data.arranged) {
      toast.info('Opponent has completed arranging cards');
      
      // If both players have arranged their cards, proceed to game board
      if (store.cardsArranged && store.opponentCardsArranged) {
        toast.success('Both players ready! Starting game...');
        // Initialize game board when both players are ready
        store.initializeGameBoard();
      }
    }
  }

  private setupGameListeners() {
    console.log('Setting up game listeners');
    
    this.socket?.on('bid_submitted', (data: { player: 'host' | 'guest' }) => {
      console.log('Bid submitted event received:', data);
      const store = useGameStore.getState();
      const isHost = store.isHost;
      
      // Update bid status based on who submitted and player's role
      if (data.player === 'host') {
        if (isHost) {
          store.setHostBidSubmitted(true);
          console.log('Host (you) bid submitted');
        } else {
          store.setGuestBidSubmitted(false);
          store.setHostBidSubmitted(true);
          console.log('Host (opponent) bid submitted');
        }
      } else {
        if (isHost) {
          store.setHostBidSubmitted(false);
          store.setGuestBidSubmitted(true);
          console.log('Guest (opponent) bid submitted');
        } else {
          store.setGuestBidSubmitted(true);
          console.log('Guest (you) bid submitted');
        }
      }
    });

    this.socket?.on('bid_tie', (data) => {
      console.log('Bid tie event received:', data);
      const store = useGameStore.getState();
      store.handleBidTie(data);
      toast.info('Bids tied! Each player gets 2 bonus tokens. Bid again.');
    });

    this.socket?.on('bid_complete', (data) => {
      console.log('Bid complete event received:', data);
      const store = useGameStore.getState();
      store.handleBidComplete(data);
      const winnerText = data.winner === (store.isHost ? 'host' : 'guest') ? 'You' : 'Opponent';
      toast.success(`${winnerText} won the bid!`);
    });

    this.socket?.on('round_started', (data) => {
      console.log('Round started event received:', data);
      const store = useGameStore.getState();
      store.handleNewRound(data);
      toast.info(`Round ${data.roundNumber} started!`);
    });

    this.socket?.on('bid_error', (data: { message: string }) => {
      console.error('Bid error:', data.message);
      toast.error(data.message);
    });

    // Add debug logging for all incoming socket events
    this.socket?.onAny((eventName, ...args) => {
      console.log('=== DEBUG: Socket Event Received ===');
      console.log('Event:', eventName);
      console.log('Data:', args);
    });

    // Register truth guess result handler explicitly
    this.socket?.on('truth_guess_result', (data: {
      correct: boolean;
      isGuesser: boolean;
      actualArrangement?: string;
    }) => {
      console.log('=== DEBUG: Truth guess result received ===');
      console.log('Data:', data);
      
      const store = useGameStore.getState();
      console.log('Current game state:', {
        selectedAction: store.gameBoardState.selectedAction,
        truthGuessResult: store.gameBoardState.truthGuessResult
      });
      
      store.setTruthGuessResult(data);
      console.log('Updated truthGuessResult:', store.gameBoardState.truthGuessResult);
      
      if (data.correct) {
        if (data.isGuesser) {
          toast.success('Correct guess! You win!');
          store.handleGameWin();
        } else {
          toast.error('Your opponent guessed correctly. Game Over!');
          store.handleGameLose();
        }
        console.log('Game ended, updated state:', store.gameBoardState);
      } else {
        if (data.isGuesser) {
          toast.error('Wrong guess!');
          store.handleGameLose();
        } else {
          toast.success('Your opponent guessed wrong!');
        }
        console.log('Game continues, updated state:', store.gameBoardState);
      }
    });
  }
}

export const socketService = new SocketService();