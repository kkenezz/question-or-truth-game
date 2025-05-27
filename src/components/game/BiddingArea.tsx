import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { socketService } from '../../services/socketService';
import Button from '../ui/Button';

const BiddingArea: React.FC = () => {
  const [bidAmount, setBidAmount] = useState<number>(0);
  const { 
    roomCode,
    gameBoardState: { playerTokens, currentPhase },
    hostBidSubmitted,
    guestBidSubmitted,
    lastBidAmount,
    isHost
  } = useGameStore();

  const handleBidSubmit = () => {
    if (bidAmount < 0 || bidAmount > playerTokens) {
      return;
    }
    socketService.submitBid(roomCode, bidAmount);
  };

  const hasPlayerBid = isHost ? hostBidSubmitted : guestBidSubmitted;
  const hasOpponentBid = isHost ? guestBidSubmitted : hostBidSubmitted;

  if (currentPhase !== 'bidding') {
    return null;
  }

  const getBidStatus = () => {
    if (hasPlayerBid && hasOpponentBid) {
      return 'Both players have bid. Resolving...';
    }
    if (hasPlayerBid) {
      return 'Waiting for opponent\'s bid...';
    }
    if (hasOpponentBid) {
      return 'Opponent has bid. Your turn!';
    }
    return 'Place your bid';
  };

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{getBidStatus()}</h3>
        <span className="text-sm text-gray-400">
          Available Tokens: {playerTokens}
        </span>
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          min={0}
          max={playerTokens}
          value={bidAmount}
          onChange={(e) => setBidAmount(Math.max(0, Math.min(playerTokens, parseInt(e.target.value) || 0)))}
          className={`
            bg-gray-800 rounded px-3 py-2 w-24 text-center
            ${hasPlayerBid ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={hasPlayerBid}
        />
        
        <Button 
          onClick={handleBidSubmit}
          disabled={hasPlayerBid || bidAmount < 0 || bidAmount > playerTokens}
          variant={hasPlayerBid ? 'secondary' : 'primary'}
        >
          {hasPlayerBid ? 'Bid Submitted' : 'Confirm Bid'}
        </Button>
      </div>

      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={hasPlayerBid ? 'text-green-500' : 'text-gray-400'}>
            Your bid: {hasPlayerBid ? (
              <>
                <span className="font-medium">{lastBidAmount}</span> tokens ✓
              </>
            ) : 'Not submitted'}
          </span>
        </div>
        <div className={hasOpponentBid ? 'text-yellow-500' : 'text-gray-400'}>
          Opponent bid: {hasOpponentBid ? 'Submitted ✓' : 'Not submitted'}
        </div>
      </div>
    </div>
  );
};

export default BiddingArea; 