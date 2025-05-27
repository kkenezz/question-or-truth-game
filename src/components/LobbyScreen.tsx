import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { socketService } from '../services/socketService';
import Button from './ui/Button';
import Card from './ui/Card';
import InputField from './ui/InputField';

const LobbyScreen: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  useEffect(() => {
    console.log('Initializing socketService...');
    socketService.init();
    return () => {
      // Keep socket connection for game
    };
  }, []);
  
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    socketService.createRoom(playerName.trim());
  };
  
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    
    socketService.joinRoom(roomCode.trim(), playerName.trim());
  };
  
  return (
    <Card className="bg-gray-800/50 backdrop-blur-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Welcome to the Game</h2>
        <p className="text-gray-400">Create or join a room to play</p>
      </div>
      
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'create'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('create')}
        >
          <Users className="inline-block mr-2 h-5 w-5" />
          Create Room
        </button>
        <button
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'join'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('join')}
        >
          <UserPlus className="inline-block mr-2 h-5 w-5" />
          Join Room
        </button>
      </div>
      
      {activeTab === 'create' ? (
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <InputField
            id="create-name"
            label="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={15}
            required
          />
          
          <Button 
            type="submit" 
            fullWidth
            icon={<ArrowRight className="ml-2 h-5 w-5" />}
          >
            Create Game
          </Button>
        </form>
      ) : (
        <form onSubmit={handleJoinRoom} className="space-y-4">
          <InputField
            id="join-name"
            label="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={15}
            required
          />
          
          <InputField
            id="room-code"
            label="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter 5-letter code"
            maxLength={5}
            pattern="[A-Z0-9]{5}"
            required
          />
          
          <Button 
            type="submit" 
            fullWidth
            icon={<ArrowRight className="ml-2 h-5 w-5" />}
          >
            Join Game
          </Button>
        </form>
      )}
    </Card>
  );
};

export default LobbyScreen;