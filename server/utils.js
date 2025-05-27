// Generate a random 5-letter room code
export function generateRoomCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let result = '';
  
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Initialize empty game state (to be expanded later)
export function generateGameState() {
  return {
    started: false,
    currentPhase: 'bidding',
    roundNumber: 1,
    players: {
      host: {
        ready: false,
        cardsArranged: false,
        tokens: 10,
        currentBid: null,
        arrangedCards: []
      },
      guest: {
        ready: false,
        cardsArranged: false,
        tokens: 10,
        currentBid: null,
        arrangedCards: []
      }
    },
    bidWinner: null,
    isTie: false
  };
}

// Bidding related functions
export function handleBidSubmission(gameState, isHost, bidAmount) {
  const player = isHost ? 'host' : 'guest';
  const opponent = isHost ? 'guest' : 'host';

  // Save the bid
  gameState.players[player].currentBid = bidAmount;

  // Check if both players have bid
  if (gameState.players.host.currentBid !== null && gameState.players.guest.currentBid !== null) {
    const hostBid = gameState.players.host.currentBid;
    const guestBid = gameState.players.guest.currentBid;

    // Deduct bid tokens from both players
    gameState.players.host.tokens -= hostBid;
    gameState.players.guest.tokens -= guestBid;

    // Check for tie
    if (hostBid === guestBid) {
      gameState.isTie = true;
      // Give bonus tokens for tie
      gameState.players.host.tokens += 2;
      gameState.players.guest.tokens += 2;
    } else {
      // Determine winner
      gameState.bidWinner = hostBid > guestBid ? 'host' : 'guest';
      gameState.isTie = false;
      
      // Add round bonus tokens to both players
      gameState.players.host.tokens += 2;
      gameState.players.guest.tokens += 2;
      
      // Move to action phase if no tie
      if (!gameState.isTie) {
        gameState.currentPhase = 'action';
      }
    }

    // Reset bids if it was a tie (for rebidding)
    if (gameState.isTie) {
      gameState.players.host.currentBid = null;
      gameState.players.guest.currentBid = null;
    }

    return {
      hostBid,
      guestBid,
      hostTokens: gameState.players.host.tokens,
      guestTokens: gameState.players.guest.tokens,
      isTie: gameState.isTie,
      bidWinner: gameState.bidWinner,
      currentPhase: gameState.currentPhase
    };
  }

  return null; // Return null if waiting for other player's bid
}

export function startNewRound(gameState) {
  gameState.roundNumber += 1;
  gameState.currentPhase = 'bidding';
  gameState.bidWinner = null;
  gameState.isTie = false;
  gameState.players.host.currentBid = null;
  gameState.players.guest.currentBid = null;
  
  return {
    roundNumber: gameState.roundNumber,
    hostTokens: gameState.players.host.tokens,
    guestTokens: gameState.players.guest.tokens
  };
}

export function validateBid(gameState, isHost, bidAmount) {
  const player = gameState.players[isHost ? 'host' : 'guest'];
  
  // Check if bid is valid
  if (bidAmount < 0 || bidAmount > player.tokens) {
    return false;
  }
  
  // Check if it's bidding phase
  if (gameState.currentPhase !== 'bidding') {
    return false;
  }
  
  // Check if player hasn't bid yet
  if (player.currentBid !== null) {
    return false;
  }
  
  return true;
}