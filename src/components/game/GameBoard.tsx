import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import Card from '../ui/Card';
import TokenDisplay from './TokenDisplay';
import BiddingArea from './BiddingArea';
import ActionArea from './ActionArea';
import PlayerCards from './PlayerCards';
import OpponentCards from './OpponentCards';
import BidResult from './BidResult';
import TruthGuess from './TruthGuess';

const GameBoard: React.FC = () => {
  const { 
    playerName, 
    opponentName,
    gameBoardState: {
      playerTokens,
      opponentTokens,
      currentPhase,
      roundNumber,
      selectedAction,
      truthGuessResult
    }
  } = useGameStore();

  // Debug logging for game state
  useEffect(() => {
    console.log('GameBoard state updated:', {
      currentPhase,
      selectedAction,
      truthGuessResult
    });
  }, [currentPhase, selectedAction, truthGuessResult]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-gray-800/50 backdrop-blur-md">
        {/* Cards Section */}
        <section className="mb-6">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <PlayerCards />
            </div>
          </div>
        </section>

        {/* Game Actions and Status Section */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          {/* Left Column: Tokens and Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-center">
                <h3 className="font-medium mb-2">Your Tokens</h3>
                <div className="text-2xl font-bold text-yellow-400">{playerTokens}</div>
              </div>
            </div>
            
            {/* Show BidResult or TruthGuess under tokens when action is selected */}
            {selectedAction && (
              <div>
                <BidResult />
                <TruthGuess />
              </div>
            )}
          </div>

          {/* Right Column: Action Area */}
          <div className="flex-1">
            {currentPhase === 'bidding' ? <BiddingArea /> : <ActionArea />}
          </div>
        </section>

        {/* Token Status Section */}
        <div className="grid grid-cols-1 gap-2 mb-6">
          <TokenDisplay 
            label={`${opponentName}: Token Status`}
            tokens={opponentTokens}
            isOpponent
          />
          <TokenDisplay 
            label={`${playerName}: Token Status`}
            tokens={playerTokens}
            isOpponent={false}
          />
        </div>

        {/* Question List Section - Always at bottom after card arrangement */}
        <section className="mb-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="font-medium mb-4">Question List</h3>
            
            {/* SUM Questions */}
            <div className="mb-6">
              <h4 className="text-yellow-400 font-medium mb-2 flex items-center">
                <span className="w-20 text-center py-1 bg-yellow-400/20 rounded-full text-xs mr-2">SUM</span>
                Value Total Questions
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  Select 3 card positions. What is the total value of all those cards?
                </li>
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  Choose one card suit. What is the sum of all cards of that suit?
                </li>
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  What is the total value of all the face cards?
                </li>
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  What is the total value of all the number cards?
                </li>
              </ul>
            </div>

            {/* COUNT Questions */}
            <div className="mb-6">
              <h4 className="text-purple-400 font-medium mb-2 flex items-center">
                <span className="w-20 text-center py-1 bg-purple-400/20 rounded-full text-xs mr-2">COUNT</span>
                Card Counting Questions
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  How many face cards are there in total?
                </li>
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  How many number cards are there in total?
                </li>
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  Choose one number or face card. How many of those cards are there?
                </li>
              </ul>
            </div>

            {/* POSITION Questions */}
            <div>
              <h4 className="text-green-400 font-medium mb-2 flex items-center">
                <span className="w-20 text-center py-1 bg-green-400/20 rounded-full text-xs mr-2">POSITION</span>
                Card Location Questions
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  Choose one card suit. In which positions are those cards located?
                </li>
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  In which positions are the cards with the same rank located?
                </li>
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  In which positions are the consecutive numbered cards and face cards located?
                </li>
                <li className="pl-4 hover:bg-gray-600/30 rounded py-1 transition-colors">
                  In which position is the highest or lowest valued card located?
                </li>
              </ul>
            </div>

            <div className="mt-4 text-xs text-gray-500 italic">
              Note: Ace (A) is considered a face card with value 1
            </div>
          </div>
        </section>

        {/* Round Counter */}
        <div className="text-center text-sm text-gray-400">
          Round {roundNumber}
        </div>
      </Card>
    </div>
  );
};

export default GameBoard; 