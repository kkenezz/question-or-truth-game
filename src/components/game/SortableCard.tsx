import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type CardType } from '../../types/game';

interface SortableCardProps {
  card: CardType;
}

const SortableCard: React.FC<SortableCardProps> = ({ card }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const isRedSuit = card.suit === '♥' || card.suit === '♦';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        w-16 aspect-[3/4] rounded-lg border-2 cursor-move
        ${isDragging 
          ? 'border-purple-400 shadow-xl shadow-purple-500/50' 
          : 'border-gray-600'
        }
        bg-gray-700 flex flex-col items-center justify-center
        transform transition-transform hover:scale-105
      `}
    >
      <div className={`text-lg font-medium ${isRedSuit ? 'text-red-500' : ''}`}>
        {card.rank}
      </div>
      <div className={`text-2xl ${isRedSuit ? 'text-red-500' : ''}`}>
        {card.suit}
      </div>
    </div>
  );
};

export default SortableCard;