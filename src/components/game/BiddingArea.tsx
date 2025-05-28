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

  const handleBidAmountChange = (value: number) => {
    setBidAmount(value);
    // Update the global game state
    useGameStore.getState().setBidAmount(value);
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

      <div className="space-y-4">
        {/* Bid Input Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Bid Amount:</span>
            <span className="text-sm font-medium text-yellow-400">{bidAmount}</span>
          </div>
          
          {/* Slider Container */}
          <div className="relative h-2">
            {/* Background Track */}
            <div className="absolute inset-0 bg-gray-600 rounded-lg"></div>
            
            {/* Progress Track */}
            <div 
              className="absolute inset-y-0 left-0 bg-yellow-400/50 rounded-l-lg"
              style={{ width: `${(bidAmount / playerTokens) * 100}%` }}
            ></div>

            {/* Slider Input */}
            <input
              type="range"
              min={0}
              max={playerTokens}
              value={bidAmount}
              onChange={(e) => handleBidAmountChange(parseInt(e.target.value))}
              disabled={hasPlayerBid}
              className={`
                absolute inset-0
                w-full appearance-none bg-transparent
                cursor-pointer disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-yellow-400
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-gray-800
                [&::-webkit-slider-thumb]:relative
                [&::-webkit-slider-thumb]:z-10
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-yellow-400
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-gray-800
                [&::-moz-range-thumb]:relative
                [&::-moz-range-thumb]:z-10
              `}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleBidSubmit}
          disabled={hasPlayerBid || bidAmount < 0 || bidAmount > playerTokens}
          variant={hasPlayerBid ? 'secondary' : 'primary'}
          className="w-full"
        >
          {hasPlayerBid ? 'Bid Submitted' : 'Confirm Bid'}
        </Button>
      </div>

      {/* Bid Status */}
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