import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import Card from '../ui/Card';
import TokenDisplay from './TokenDisplay';
import BiddingArea from './BiddingArea';
import ActionArea from './ActionArea';
import PlayerCards from './PlayerCards';
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
      truthGuessResult,
      bidAmount = 0
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="bg-gray-800/50 backdrop-blur-md">
        {/* 1. Cards Section */}
        <section className="mb-6">
          <div className="flex justify-center">
            <PlayerCards />
          </div>
        </section>

        {/* 2. Your Tokens Section */}
        <section className="mb-6">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <div className="text-center space-y-2">
                <h3 className="font-medium mb-2">Your Tokens</h3>
                <div className="text-2xl font-bold text-yellow-400">{playerTokens}</div>
                {currentPhase === 'bidding' && (
                  <div className="text-sm">
                    <span className="text-gray-400">After bid: </span>
                    <span className={`font-medium ${playerTokens - bidAmount <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                      {playerTokens - bidAmount} tokens
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Choose Your Action Section */}
        <section className="mb-6">
          {currentPhase === 'bidding' ? <BiddingArea /> : <ActionArea />}
        </section>

        {/* 4. Action Results Section */}
        {selectedAction && (
          <section className="mb-6">
            <BidResult />
            <TruthGuess />
          </section>
        )}

        {/* 5. Token Status Section */}
        <section className="mb-6">
          <div className="space-y-2">
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
        </section>

        {/* Question List Section */}
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