import React, { useCallback } from 'react';
import { Card as CardType } from '../types';
import Card from './Card';

interface CardContainerProps {
  card: CardType;
  pileType: 'tableau' | 'waste' | 'foundation';
  pileIndex: number;
  isSelected: boolean;
  onCardClick: (card: CardType, pileType: 'tableau' | 'waste' | 'foundation', pileIndex: number) => void;
  onCardDoubleClick: (card: CardType, pileType: 'tableau' | 'waste' | 'foundation', pileIndex: number) => void;
  onCardDragStart: (e: React.DragEvent, card: CardType, pileType: 'tableau' | 'waste' | 'foundation', pileIndex: number) => void;
  onCardDragEnd: (e: React.DragEvent) => void;
  isDraggable: boolean;
}

const CardContainer: React.FC<CardContainerProps> = ({
  card,
  pileType,
  pileIndex,
  isSelected,
  onCardClick,
  onCardDoubleClick,
  onCardDragStart,
  onCardDragEnd,
  isDraggable,
}) => {
  const handleClick = useCallback(() => {
    onCardClick(card, pileType, pileIndex);
  }, [card, pileType, pileIndex, onCardClick]);

  const handleDoubleClick = useCallback(() => {
    onCardDoubleClick(card, pileType, pileIndex);
  }, [card, pileType, pileIndex, onCardDoubleClick]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    onCardDragStart(e, card, pileType, pileIndex);
  }, [card, pileType, pileIndex, onCardDragStart]);

  return (
    <Card
      card={card}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      isSelected={isSelected}
      isDraggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={onCardDragEnd}
    />
  );
};

export default React.memo(CardContainer); 