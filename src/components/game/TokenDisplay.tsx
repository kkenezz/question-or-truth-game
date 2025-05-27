import React from 'react';
import { Coins } from 'lucide-react';

interface TokenDisplayProps {
  label: string;
  tokens: number;
  isOpponent: boolean;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ label, tokens, isOpponent }) => {
  const isLowTokens = tokens <= 5;

  return (
    <div className={`
      rounded-lg p-4
      ${isLowTokens ? 'bg-red-900/30 border border-red-500/50' : 'bg-gray-700/30'}
      transition-colors duration-300
    `}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className={`
          font-bold
          ${isLowTokens ? 'text-red-400' : 'text-yellow-400'}
        `}>
          {isOpponent ? (
            isLowTokens ? '<= 5 tokens' : '> 5 tokens'
          ) : (
            tokens
          )}
        </span>
      </div>
    </div>
  );
};

export default TokenDisplay; 