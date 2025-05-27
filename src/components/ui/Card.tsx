import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`rounded-xl shadow-xl p-6 border border-gray-700/50 ${className || ''}`}>
      {children}
    </div>
  );
};

export default Card;