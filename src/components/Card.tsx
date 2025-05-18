import React, { useMemo } from 'react';
import { Card as CardType } from '../types';
import styles from './Card.module.css';

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
  const { suitSymbol, colorClass } = useMemo(() => ({
    suitSymbol: getSuitSymbol(card.suit),
    colorClass: getColorClass(card.suit),
  }), [card.suit]);

  const getFaceCardImage = (rank: string, suit: string) => {
    const suitName = suit.toLowerCase();
    return `/assets/images/cards/${rank.toLowerCase()}_of_${suitName}.jpg`;
  };

  const renderSuitPattern = () => {
    const rank = card.rank;
    if (rank === 'J' || rank === 'Q' || rank === 'K') {
      return (
        <div className={styles.cardCenter}>
          <img 
            src={getFaceCardImage(rank, card.suit)}
            alt={`${rank} of ${card.suit}`}
            className={styles.cardFaceImage}
          />
        </div>
      );
    }

    const numericRank = rank === 'A' ? 1 : parseInt(rank);
    if (isNaN(numericRank)) return null;

    const suitElement = <span className={`${styles.cardSuitPattern} ${styles[colorClass]}`}>{suitSymbol}</span>;
    
    if (numericRank === 5) {
      return (
        <div className={styles.cardCenter}>
          <div className={`${styles.cardPattern} ${styles.pattern5}`}>
            {suitElement}
            {suitElement}
            {suitElement}
            {suitElement}
            {suitElement}
          </div>
        </div>
      );
    }

    if (numericRank === 7) {
      return (
        <div className={styles.cardCenter}>
          <div className={`${styles.cardPattern} ${styles.pattern7}`}>
            {suitElement}
            {suitElement}
            {suitElement}
            {suitElement}
            {suitElement}
            {suitElement}
            {suitElement}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.cardCenter}>
        <div className={`${styles.cardPattern} ${styles[`pattern${numericRank}`]}`}>
          {Array(numericRank).fill(null).map((_, index) => (
            <React.Fragment key={index}>{suitElement}</React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  if (!card.isFaceUp) {
    return (
      <div
        className={`${styles.card} ${styles.cardBack} ${isSelected ? styles.selected : ''}`}
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
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className={styles.cardContent}>
        <div className={styles.cardTop}>
          <div className={styles.cardCorner}>
            <span className={`${styles.cardRank} ${styles[colorClass]}`}>{card.rank}</span>
            <span className={`${styles.cardSuit} ${styles[colorClass]}`}>{suitSymbol}</span>
          </div>
        </div>
        {renderSuitPattern()}
        <div className={styles.cardBottom}>
          <div className={styles.cardCorner}>
            <span className={`${styles.cardRank} ${styles[colorClass]}`}>{card.rank}</span>
            <span className={`${styles.cardSuit} ${styles[colorClass]}`}>{suitSymbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const getColorClass = (suit: string) => {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
};

export default React.memo(Card); 