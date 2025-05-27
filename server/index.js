import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import { generateRoomCode, generateGameState } from './utils.js';
import { handleBidding, handleNewRound, handleTruthGuess, handleActionSelection, handleSaveArrangedCards } from './socket-handlers.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Update CORS configuration for Render
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://question-or-truth-frontend.onrender.com', // Add Render frontend URL
  /\.onrender\.com$/ // Allow all Render deployments
];

// Configure Socket.IO with updated CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is allowed
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        if (typeof allowedOrigin === 'string' && allowedOrigin === process.env.VERCEL_URL) {
          return origin.includes(allowedOrigin);
        }
        return allowedOrigin === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type']
  },
  pingTimeout: 10000,
  pingInterval: 5000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e6
});

// Configure Express CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Store active rooms with additional metadata
const rooms = new Map();

// Helper function to clean up disconnected player
const cleanupDisconnectedPlayer = (socket, roomCode) => {
  const room = rooms.get(roomCode);
  if (!room) return;

  let isHost = false;
  let isGuest = false;

  if (room.host?.id === socket.id) {
    isHost = true;
    if (room.guest) {
      io.to(room.guest.id).emit('host-disconnected');
    }
    rooms.delete(roomCode);
    console.log(`Room ${roomCode} closed (host disconnected)`);
  } else if (room.guest?.id === socket.id) {
    isGuest = true;
    room.guest = null;
    rooms.set(roomCode, room);
    io.to(room.host.id).emit('guest-disconnected');
    console.log(`Guest left room ${roomCode}`);
  }

  return { isHost, isGuest };
};

// Helper function to validate room state
const validateRoomState = (roomCode, socket, playerName) => {
  const room = rooms.get(roomCode);
  
  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return false;
  }

  if (room.guest !== null) {
    socket.emit('error', { message: 'Room is full' });
    return false;
  }

  // Check for duplicate names
  if (room.host.name.toLowerCase() === playerName.toLowerCase()) {
    socket.emit('error', { message: 'Name already taken in this room' });
    return false;
  }

  return true;
};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  let currentRoom = null;

  // Add this debug listener to catch ALL events
  socket.onAny((eventName, ...args) => {
    console.log(`[${socket.id}] Received event: ${eventName}`, args);
  });

  // Register handlers
  handleBidding(io, socket, rooms);
  handleNewRound(io, socket, rooms);
  handleTruthGuess(io, socket, rooms);
  handleActionSelection(io, socket, rooms);
  handleSaveArrangedCards(io, socket, rooms);

  // Create a new room
  socket.on('create-room', ({ playerName }) => {
    try {
      if (!playerName?.trim()) {
        return socket.emit('error', { message: 'Invalid player name' });
      }

      let roomCode;
      let attempts = 0;
      const maxAttempts = 5;

      // Generate unique room code
      do {
        roomCode = generateRoomCode();
        attempts++;
        if (attempts > maxAttempts) {
          throw new Error('Failed to generate unique room code');
        }
      } while (rooms.has(roomCode));
      
      // Initialize room data
      rooms.set(roomCode, {
        host: {
          id: socket.id,
          name: playerName,
        },
        guest: null,
        gameState: generateGameState(),
        createdAt: Date.now(),
        lastActivity: Date.now()
      });

      // Join the room
      socket.join(roomCode);
      currentRoom = roomCode;
      
      // Send room info back to creator
      socket.emit('room-created', { 
        roomCode, 
        isHost: true, 
        playerName
      });

      console.log(`Room created hh: ${roomCode} by ${playerName}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to create room' });
      console.error('Error creating room:', error);
    }
  });

  // Join an existing room
  socket.on('join-room', ({ roomCode, playerName }) => {
    try {
      if (!playerName?.trim() || !roomCode?.trim()) {
        return socket.emit('error', { message: 'Invalid player name or room code' });
      }

      const normalizedRoomCode = roomCode.toUpperCase();
      
      // Validate room state
      if (!validateRoomState(normalizedRoomCode, socket, playerName)) {
        return;
      }

      const roomData = rooms.get(normalizedRoomCode);

      // Add player to room
      roomData.guest = {
        id: socket.id,
        name: playerName
      };
      
      roomData.lastActivity = Date.now();
      
      // Update room data
      rooms.set(normalizedRoomCode, roomData);

      // Join the socket room
      socket.join(normalizedRoomCode);
      currentRoom = normalizedRoomCode;
      
      // Notify the joining player
      socket.emit('room-joined', { 
        roomCode: normalizedRoomCode, 
        isHost: false,
        hostName: roomData.host.name,
        playerName
      });

      // Notify the host
      io.to(roomData.host.id).emit('player-joined', {
        playerName,
        isReady: false
      });

      console.log(`Player ${playerName} joined room: ${normalizedRoomCode}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
      console.error('Error joining room:', error);
    }
  });

  // Set player ready status
  socket.on('player-ready', ({ roomCode, isReady }) => {
    try {
      const room = rooms.get(roomCode);
      if (!room) return;

      // Determine if this socket is host or guest
      const isHost = room.host.id === socket.id;
      const isGuest = room.guest && room.guest.id === socket.id;

      if (!isHost && !isGuest) return;

      // Update ready status for the player's role
      if (isHost) {
        io.to(room.guest.id).emit('opponent-ready', { isReady });
      } else if (isGuest) {
        io.to(room.host.id).emit('opponent-ready', { isReady });
      }
    } catch (error) {
      console.error('Error setting ready status:', error);
    }
  });

  // Start game (host only)
  socket.on('start-game', ({ roomCode }) => {
    try {
      const room = rooms.get(roomCode);
      if (!room || room.host.id !== socket.id) return;

      // Start the game
      const gameState = generateGameState();
      room.gameState = gameState;
      
      // Notify both players
      io.to(roomCode).emit('game-start', { gameState });
      console.log(`Game started in room: ${roomCode}`);
      
      // Update room data
      rooms.set(roomCode, room);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  });

  // Handle cards arranged status
  socket.on('cards-arranged', ({ roomCode, arranged }) => {
    try {
      const room = rooms.get(roomCode);
      if (!room) return;

      // Determine if this socket is host or guest
      const isHost = room.host.id === socket.id;
      const isGuest = room.guest && room.guest.id === socket.id;

      if (!isHost && !isGuest) return;

      // Update game state with arrangement status
      if (isHost) {
        room.gameState.players.host.cardsArranged = arranged;
        if (room.guest) {
          io.to(room.guest.id).emit('cards-arranged', { arranged });
        }
      } else if (isGuest) {
        room.gameState.players.guest.cardsArranged = arranged;
        io.to(room.host.id).emit('cards-arranged', { arranged });
      }

      // Update room data
      rooms.set(roomCode, room);

      // Check if both players have arranged their cards
      if (room.gameState.players.host.cardsArranged && 
          room.gameState.players.guest?.cardsArranged) {
        // Both players have arranged their cards
        io.to(roomCode).emit('both-players-arranged');
        console.log(`Both players have arranged cards in room: ${roomCode}`);
      }

    } catch (error) {
      console.error('Error handling cards arranged status:', error);
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    try {
      if (currentRoom) {
        cleanupDisconnectedPlayer(socket, currentRoom);
      }
      console.log(`User disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Clean up expired rooms (older than 2 hours) and inactive rooms (no activity for 30 minutes)
setInterval(() => {
  const now = Date.now();
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const THIRTY_MINUTES = 30 * 60 * 1000;
  
  for (const [roomCode, roomData] of rooms.entries()) {
    const isExpired = now - roomData.createdAt > TWO_HOURS;
    const isInactive = now - roomData.lastActivity > THIRTY_MINUTES;
    
    if (isExpired || isInactive) {
      // Notify any connected players
      if (roomData.host) {
        io.to(roomData.host.id).emit('room-expired');
      }
      if (roomData.guest) {
        io.to(roomData.guest.id).emit('room-expired');
      }
      
      // Delete the room
      rooms.delete(roomCode);
      console.log(`Room ${roomCode} ${isExpired ? 'expired' : 'inactive'} and removed`);
    }
  }
}, 15 * 60 * 1000); // Check every 15 minutes

// Export for Vercel
export default app;

// Only start the server if we're not in Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}