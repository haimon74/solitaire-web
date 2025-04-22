import React from 'react';
import { Card as CardType } from '../types';
import './Card.css';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isSelected?: boolean;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  onClick,
  onDoubleClick,
  isSelected = false,
  isDraggable = false,
  onDragStart,
  onDragEnd,
}) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
      case 'spades':
        return '♠';
      default:
        return '';
    }
  };

  const getCardColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  };

  if (!card.isFaceUp) {
    return (
      <div
        className={`card card-back ${isSelected ? 'selected' : ''}`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        draggable={isDraggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    );
  }

  return (
    <div
      className={`card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="card-content" style={{ color: getCardColor(card.suit) }}>
        <div className="card-top">
          <span className="card-rank">{card.rank}</span>
          <span className="card-suit">{getSuitSymbol(card.suit)}</span>
        </div>
        <div className="card-center">
          <span className="card-suit-large">{getSuitSymbol(card.suit)}</span>
        </div>
        <div className="card-bottom">
          <span className="card-rank">{card.rank}</span>
          <span className="card-suit">{getSuitSymbol(card.suit)}</span>
        </div>
      </div>
    </div>
  );
};

export default Card; 