import { validateBid, handleBidSubmission, startNewRound } from './utils.js';

// Bidding related socket handlers
export function handleBidding(io, socket, rooms) {
  socket.on('submit_bid', ({ roomCode, bid }) => {
    console.log(`[Room ${roomCode}] Received bid:`, { 
      socketId: socket.id,
      bid,
      roomExists: rooms.has(roomCode)
    });

    const room = rooms.get(roomCode);
    if (!room) {
      console.error(`[Room ${roomCode}] Room not found`);
      return;
    }

    const isHost = room.host.id === socket.id;
    const gameState = room.gameState;

    console.log(`[Room ${roomCode}] Player role:`, { 
      isHost,
      currentPhase: gameState.currentPhase,
      playerTokens: gameState.players[isHost ? 'host' : 'guest'].tokens
    });
    
    // Validate bid
    if (!validateBid(gameState, isHost, bid)) {
      console.error(`[Room ${roomCode}] Invalid bid:`, {
        bid,
        playerTokens: gameState.players[isHost ? 'host' : 'guest'].tokens,
        currentPhase: gameState.currentPhase,
        hasPreviousBid: gameState.players[isHost ? 'host' : 'guest'].currentBid !== null
      });
      socket.emit('bid_error', { message: 'Invalid bid' });
      return;
    }

    // Process bid submission
    console.log(`[Room ${roomCode}] Processing bid submission:`, {
      player: isHost ? 'host' : 'guest',
      bid
    });
    
    const result = handleBidSubmission(gameState, isHost, bid);
    
    // Notify room that one player has bid
    io.to(roomCode).emit('bid_submitted', {
      player: isHost ? 'host' : 'guest'
    });
    
    // If both players have bid, notify room of the outcome
    if (result) {
      console.log(`[Room ${roomCode}] Bid round complete:`, result);
      
      if (result.isTie) {
        io.to(roomCode).emit('bid_tie', {
          hostBid: result.hostBid,
          guestBid: result.guestBid,
          hostTokens: result.hostTokens,
          guestTokens: result.guestTokens
        });
      } else {
        io.to(roomCode).emit('bid_complete', {
          winner: result.bidWinner,
          hostBid: result.hostBid,
          guestBid: result.guestBid,
          hostTokens: result.hostTokens,
          guestTokens: result.guestTokens,
          currentPhase: result.currentPhase
        });
      }
    }

    // Update room data
    room.lastActivity = Date.now();
    rooms.set(roomCode, room);
  });
}

export function handleNewRound(io, socket, rooms) {
  socket.on('start_new_round', ({ roomCode }) => {
    console.log(`[Room ${roomCode}] Starting new round`);
    
    const room = rooms.get(roomCode);
    if (!room) {
      console.error(`[Room ${roomCode}] Room not found`);
      return;
    }

    const result = startNewRound(room.gameState);
    console.log(`[Room ${roomCode}] New round started:`, result);
    
    io.to(roomCode).emit('round_started', {
      roundNumber: result.roundNumber,
      hostTokens: result.hostTokens,
      guestTokens: result.guestTokens
    });

    // Update room data
    room.lastActivity = Date.now();
    rooms.set(roomCode, room);
  });
}

// Action selection handler
export function handleActionSelection(io, socket, rooms) {
  socket.on('select-action', ({ roomCode, action }) => {
    console.log(`[Room ${roomCode}] Action selected:`, { 
      socketId: socket.id,
      action
    });

    const room = rooms.get(roomCode);
    if (!room) {
      console.error(`[Room ${roomCode}] Room not found`);
      return;
    }

    const isHost = room.host.id === socket.id;
    const gameState = room.gameState;
    const player = isHost ? 'host' : 'guest';

    // Verify it's the player's turn
    if (gameState.currentPhase !== 'action' || gameState.bidWinner !== player) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }

    // Update game state with selected action
    gameState.selectedAction = action;
    console.log(`[Room ${roomCode}] Game state updated:`, {
      currentPhase: gameState.currentPhase,
      bidWinner: gameState.bidWinner,
      selectedAction: gameState.selectedAction
    });

    // Update room data
    room.lastActivity = Date.now();
    rooms.set(roomCode, room);
  });
}

// Save arranged cards handler
export function handleSaveArrangedCards(io, socket, rooms) {
  socket.on('save-arranged-cards', ({ roomCode, cards }) => {
    console.log(`[Room ${roomCode}] Saving arranged cards:`, { 
      socketId: socket.id,
      numCards: cards.length
    });

    const room = rooms.get(roomCode);
    if (!room) {
      console.error(`[Room ${roomCode}] Room not found`);
      return;
    }

    const isHost = room.host.id === socket.id;
    const gameState = room.gameState;
    const player = isHost ? 'host' : 'guest';

    // Save the arranged cards
    gameState.players[player].arrangedCards = cards;
    console.log(`[Room ${roomCode}] Cards saved for ${player}:`, {
      numCards: cards.length,
      cards: cards
    });

    // Update room data
    room.lastActivity = Date.now();
    rooms.set(roomCode, room);
  });
}

// Truth guess handler
export function handleTruthGuess(io, socket, rooms) {
  socket.on('submit_truth_guess', ({ roomCode, guess }) => {
    console.log(`[Room ${roomCode}] Received truth guess:`, { 
      socketId: socket.id,
      guess
    });

    const room = rooms.get(roomCode);
    if (!room) {
      console.error(`[Room ${roomCode}] Room not found`);
      return;
    }

    const isHost = room.host.id === socket.id;
    const gameState = room.gameState;
    const player = isHost ? 'host' : 'guest';
    const opponent = isHost ? 'guest' : 'host';

    console.log(`[Room ${roomCode}] Game state check:`, {
      currentPhase: gameState.currentPhase,
      bidWinner: gameState.bidWinner,
      selectedAction: gameState.selectedAction,
      player
    });

    // Verify it's the player's turn and they chose 'truth' action
    if (gameState.currentPhase !== 'action' || gameState.bidWinner !== player || gameState.selectedAction !== 'truth') {
      socket.emit('error', { message: 'Invalid action' });
      return;
    }

    // Get opponent's card arrangement
    const opponentCards = gameState.players[opponent].arrangedCards;
    if (!opponentCards || opponentCards.length === 0) {
      console.error(`[Room ${roomCode}] No opponent cards found:`, {
        opponent,
        opponentData: gameState.players[opponent],
        gameState: {
          currentPhase: gameState.currentPhase,
          bidWinner: gameState.bidWinner,
          selectedAction: gameState.selectedAction
        }
      });
      socket.emit('error', { message: 'Opponent cards not found' });
      return;
    }

    const opponentArrangement = opponentCards.map(card => {
      if (card.value === 1) return 'A';
      if (card.value === 10) return 'T';
      if (card.value === 11) return 'J';
      if (card.value === 12) return 'Q';
      if (card.value === 13) return 'K';
      return card.value.toString();
    }).join('');

    console.log(`[Room ${roomCode}] Comparing arrangements:`, {
      guess,
      actual: opponentArrangement
    });

    // Compare guess with actual arrangement
    const isCorrect = guess === opponentArrangement;
    
    // Send different results to guesser and opponent
    // To guesser
    socket.emit('truth_guess_result', {
      correct: isCorrect,
      isGuesser: true,
      // Only show arrangement if they won
      actualArrangement: isCorrect ? opponentArrangement : undefined
    });

    // To opponent
    const opponentSocket = isHost ? room.guest.id : room.host.id;
    io.to(opponentSocket).emit('truth_guess_result', {
      correct: isCorrect,
      isGuesser: false,
      // Never show arrangement to opponent
      actualArrangement: undefined
    });

    // Update game state
    if (isCorrect) {
      gameState.winner = player;
      gameState.gameOver = true;
    } else {
      // Reset for next round if guess was wrong
      gameState.currentPhase = 'bidding';
      gameState.bidWinner = null;
      gameState.selectedAction = null;
      gameState.players.host.currentBid = null;
      gameState.players.guest.currentBid = null;
      
      // Start new round after a short delay
      setTimeout(() => {
        const result = startNewRound(gameState);
        io.to(roomCode).emit('round_started', {
          roundNumber: result.roundNumber,
          hostTokens: result.hostTokens,
          guestTokens: result.guestTokens
        });
      }, 3000);
    }

    // Update room data
    room.lastActivity = Date.now();
    rooms.set(roomCode, room);
  });
} 