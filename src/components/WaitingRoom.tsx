import React, { useState } from 'react';
import { Copy, LogOut, UserCheck, UserX, Play } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socketService';
import Button from './ui/Button';
import Card from './ui/Card';

const WaitingRoom: React.FC = () => {
  const { 
    roomCode, 
    playerName, 
    isHost, 
    opponentName, 
    opponentReady,
    isPlayerReady,
    resetRoom 
  } = useGameStore();
  
  const [copied, setCopied] = useState(false);
  
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success('Room code copied to clipboard!');
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleToggleReady = () => {
    socketService.setPlayerReady(roomCode, !isPlayerReady);
  };
  
  const handleStartGame = () => {
    if (!canStartGame) {
      toast.error('Cannot start game yet');
      return;
    }
    socketService.startGame(roomCode);
  };
  
  const handleLeaveRoom = () => {
    resetRoom();
  };
  
  const canStartGame = isHost && opponentReady && isPlayerReady;
  const waitingForOpponent = !opponentName;
  
  return (
    <Card className="bg-gray-800/50 backdrop-blur-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Waiting Room</h2>
        <p className="text-gray-400">
          {isHost ? 'You created this room' : 'You joined this room'}
        </p>
      </div>
      
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Room Code:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-lg font-bold tracking-wider">{roomCode}</span>
            <button
              onClick={handleCopyRoomCode}
              className="text-gray-400 hover:text-white transition-colors"
              title="Copy room code"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-6 mb-6">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h3 className="font-medium mb-2">Players</h3>
          
          <div className="space-y-3">
            {/* Current player */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span>{playerName} (You)</span>
              </div>
              {isPlayerReady ? (
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                  Ready
                </span>
              ) : (
                <span className="bg-gray-600/20 text-gray-400 text-xs px-2 py-1 rounded">
                  Not Ready
                </span>
              )}
            </div>
            
            {/* Opponent */}
            <div className="flex items-center justify-between">
              {opponentName ? (
                <>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>{opponentName}</span>
                  </div>
                  {opponentReady ? (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                      Ready
                    </span>
                  ) : (
                    <span className="bg-gray-600/20 text-gray-400 text-xs px-2 py-1 rounded">
                      Not Ready
                    </span>
                  )}
                </>
              ) : (
                <div className="flex items-center text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                  <span>Waiting for opponent...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h3 className="font-medium mb-2">Status</h3>
          
          {waitingForOpponent ? (
            <p className="text-yellow-400 flex items-center">
              <UserX className="h-5 w-5 mr-2" />
              Waiting for another player to join
            </p>
          ) : canStartGame ? (
            <p className="text-green-400 flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Ready to start the game!
            </p>
          ) : (
            <p className="text-yellow-400 flex items-center">
              <UserX className="h-5 w-5 mr-2" />
              Waiting for all players to be ready
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={isPlayerReady ? "secondary" : "primary"}
          onClick={handleToggleReady}
          disabled={!opponentName}
        >
          {isPlayerReady ? 'Not Ready' : 'Ready'}
        </Button>
        
        {isHost ? (
          <Button 
            variant="primary"
            onClick={handleStartGame}
            disabled={!canStartGame}
            icon={<Play className="ml-2 h-5 w-5" />}
          >
            Start Game
          </Button>
        ) : (
          <Button 
            variant="danger" 
            onClick={handleLeaveRoom}
            icon={<LogOut className="ml-2 h-5 w-5" />}
          >
            Leave
          </Button>
        )}
      </div>
    </Card>
  );
};

export default WaitingRoom;