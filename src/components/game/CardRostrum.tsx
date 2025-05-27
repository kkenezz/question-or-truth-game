import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { type CardType } from '../../types/game';
import SortableCard from './SortableCard';

interface CardRostrumProps {
  cards: CardType[];
  setCards: (cards: CardType[]) => void;
}

const CardRostrum: React.FC<CardRostrumProps> = ({ cards, setCards }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
    >
      <div className="p-4 bg-gray-700/30 rounded-xl">
        <div className="flex justify-center gap-2 min-h-[120px]">
          <SortableContext items={cards} strategy={horizontalListSortingStrategy}>
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} />
            ))}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
};

export default CardRostrum;