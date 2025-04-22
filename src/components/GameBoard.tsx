import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, Card, PileType, TableauColumn, Suit } from '../types';
import { Deck } from '../utils/Deck';
import CardContainer from './CardContainer';
import UndoButton from './UndoButton';
import './GameBoard.css';

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    tableau: [],
    stock: [],
    waste: [],
    foundations: [
      { suit: 'hearts' as Suit, cards: [] },
      { suit: 'diamonds' as Suit, cards: [] },
      { suit: 'clubs' as Suit, cards: [] },
      { suit: 'spades' as Suit, cards: [] },
    ],
    selectedCard: null,
    selectedPile: null,
    selectedPileIndex: null,
  });

  const [gameHistory, setGameHistory] = useState<GameState[]>([]);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = useCallback(() => {
    const deck = new Deck();
    const tableau = deck.dealTableau();
    const stock = deck.getRemainingCards();

    const initialState: GameState = {
      tableau,
      stock,
      waste: [],
      foundations: [
        { suit: 'hearts' as Suit, cards: [] },
        { suit: 'diamonds' as Suit, cards: [] },
        { suit: 'clubs' as Suit, cards: [] },
        { suit: 'spades' as Suit, cards: [] },
      ],
      selectedCard: null,
      selectedPile: null,
      selectedPileIndex: null,
    };

    setGameState(initialState);
    setGameHistory([initialState]);
  }, []);

  const updateGameState = useCallback((newState: GameState) => {
    setGameState(newState);
    setGameHistory(prev => [...prev, newState]);
  }, []);

  const handleUndo = useCallback(() => {
    if (gameHistory.length > 1) {
      const previousState = gameHistory[gameHistory.length - 2];
      setGameState(previousState);
      setGameHistory(prev => prev.slice(0, -1));
    }
  }, [gameHistory]);

  const moveCardsToTableau = useCallback((cards: Card[], sourcePile: string, sourcePileIndex: number, targetPileIndex: number, sourceCardIndex?: number) => {
    const newState = JSON.parse(JSON.stringify(gameState));
    
    if (sourcePile === 'tableau') {
      const sourceColumn = newState.tableau[sourcePileIndex];
      // Remove the cards from the source column
      sourceColumn.cards = sourceColumn.cards.slice(0, sourceCardIndex);
      // Reveal the new top card if it exists and is face down
      if (sourceColumn.cards.length > 0 && !sourceColumn.cards[sourceColumn.cards.length - 1].isFaceUp) {
        sourceColumn.cards[sourceColumn.cards.length - 1].isFaceUp = true;
      }
    } else if (sourcePile === 'waste') {
      newState.waste = newState.waste.slice(0, -1);
    } else if (sourcePile === 'foundation') {
      const foundation = newState.foundations[sourcePileIndex];
      foundation.cards = foundation.cards.slice(0, -1);
    }
    
    // Add all cards to the target column
    newState.tableau[targetPileIndex].cards.push(...cards);
    
    updateGameState(newState);
  }, [gameState, updateGameState]);

  const moveCardToFoundation = useCallback((sourcePile: string, sourcePileIndex: number, targetPileIndex: number) => {
    const newState = JSON.parse(JSON.stringify(gameState));
    
    // Get and remove the card in one operation
    let card: Card | null = null;
    switch (sourcePile) {
      case 'tableau':
        const column = newState.tableau[sourcePileIndex];
        if (column.cards.length > 0) {
          card = column.cards[column.cards.length - 1];
          column.cards = column.cards.slice(0, -1);
          if (column.cards.length > 0 && !column.cards[column.cards.length - 1].isFaceUp) {
            column.cards[column.cards.length - 1].isFaceUp = true;
          }
        }
        break;
      case 'waste':
        if (newState.waste.length > 0) {
          card = newState.waste[newState.waste.length - 1];
          newState.waste = newState.waste.slice(0, -1);
        }
        break;
      case 'foundation':
        const foundation = newState.foundations[sourcePileIndex];
        if (foundation.cards.length > 0) {
          card = foundation.cards[foundation.cards.length - 1];
          foundation.cards = foundation.cards.slice(0, -1);
        }
        break;
    }
    
    if (card) {
      newState.foundations[targetPileIndex].cards.push(card);
    }
    
    updateGameState(newState);
  }, [gameState, updateGameState]);

  const moveSingleCardToFoundation = useCallback((card: Card, sourcePile: string, sourcePileIndex: number, targetPileIndex: number, sourceCardIndex?: number) => {
    const newState = JSON.parse(JSON.stringify(gameState));
    
    if (sourcePile === 'tableau') {
      const sourceColumn = newState.tableau[sourcePileIndex];
      // Remove the specific card
      sourceColumn.cards.splice(sourceCardIndex, 1);
      // Reveal the new top card if it exists and is face down
      if (sourceColumn.cards.length > 0 && !sourceColumn.cards[sourceColumn.cards.length - 1].isFaceUp) {
        sourceColumn.cards[sourceColumn.cards.length - 1].isFaceUp = true;
      }
    } else if (sourcePile === 'waste') {
      newState.waste = newState.waste.slice(0, -1);
    }
    
    // Add the card to the foundation
    newState.foundations[targetPileIndex].cards.push(card);
    
    updateGameState(newState);
  }, [gameState, updateGameState]);

  const handleCardClick = useCallback((card: Card, pileType: 'tableau' | 'waste' | 'foundation', pileIndex: number) => {
    updateGameState({
      ...gameState,
      selectedCard: card,
      selectedPile: pileType,
      selectedPileIndex: pileIndex,
    });
  }, [gameState, updateGameState]);

  const handleCardDoubleClick = useCallback((card: Card, pileType: 'tableau' | 'waste' | 'foundation', pileIndex: number) => {
    if (!card.isFaceUp) return;

    // Try to find valid moves
    const validFoundationMoves: { type: 'foundation'; index: number }[] = [];
    const validTableauMoves: { type: 'tableau'; index: number }[] = [];

    // Check foundation moves first
    for (let i = 0; i < gameState.foundations.length; i++) {
      const foundation = gameState.foundations[i];
      if (Deck.canPlaceCardOnFoundation(card, foundation.cards)) {
        validFoundationMoves.push({ type: 'foundation', index: i });
      }
    }

    // If no foundation moves, check tableau moves
    if (validFoundationMoves.length === 0) {
      for (let i = 0; i < gameState.tableau.length; i++) {
        const targetColumn = gameState.tableau[i];
        if (targetColumn.cards.length === 0) {
          if (card.rank === 'K') {
            validTableauMoves.push({ type: 'tableau', index: i });
          }
        } else {
          const targetCard = targetColumn.cards[targetColumn.cards.length - 1];
          if (Deck.canPlaceCardOnTableau(card, targetCard)) {
            validTableauMoves.push({ type: 'tableau', index: i });
          }
        }
      }
    }

    // Execute the first valid move, prioritizing foundation
    const move = validFoundationMoves[0] || validTableauMoves[0];
    if (move) {
      if (move.type === 'foundation') {
        if (pileType === 'tableau') {
          const column = gameState.tableau[pileIndex];
          const cardIndex = column.cards.findIndex(c => c === card);
          if (cardIndex !== -1) {
            if (cardIndex === column.cards.length - 1) {
              moveCardToFoundation(pileType, pileIndex, move.index);
            } else {
              moveSingleCardToFoundation(card, pileType, pileIndex, move.index, cardIndex);
            }
          }
        } else if (pileType === 'waste') {
          moveCardToFoundation(pileType, pileIndex, move.index);
        } else if (pileType === 'foundation') {
          // Only allow moving from foundation to tableau
          const targetColumn = gameState.tableau[move.index];
          if (targetColumn.cards.length === 0) {
            if (card.rank === 'K') {
              moveCardsToTableau([card], pileType, pileIndex, move.index);
            }
          } else {
            const targetCard = targetColumn.cards[targetColumn.cards.length - 1];
            if (Deck.canPlaceCardOnTableau(card, targetCard)) {
              moveCardsToTableau([card], pileType, pileIndex, move.index);
            }
          }
        }
      } else if (move.type === 'tableau') {
        if (pileType === 'tableau') {
          const column = gameState.tableau[pileIndex];
          const cardIndex = column.cards.findIndex(c => c === card);
          if (cardIndex !== -1) {
            const cardsToMove = column.cards.slice(cardIndex);
            moveCardsToTableau(cardsToMove, pileType, pileIndex, move.index, cardIndex);
          }
        } else if (pileType === 'waste') {
          moveCardsToTableau([card], pileType, pileIndex, move.index);
        } else if (pileType === 'foundation') {
          moveCardsToTableau([card], pileType, pileIndex, move.index);
        }
      }
    }
  }, [gameState, moveCardToFoundation, moveSingleCardToFoundation, moveCardsToTableau]);

  const handleCardDragStart = useCallback((e: React.DragEvent, card: Card, pileType: 'tableau' | 'waste' | 'foundation', pileIndex: number) => {
    if (pileType === 'tableau') {
      const column = gameState.tableau[pileIndex];
      const cardIndex = column.cards.findIndex(c => c === card);
      if (cardIndex !== -1) {
        // Get all cards from the selected card to the top of the column
        const cardsToMove = column.cards.slice(cardIndex);
        e.dataTransfer.setData('text/plain', JSON.stringify({
          cards: cardsToMove,
          sourcePile: pileType,
          sourcePileIndex: pileIndex,
          sourceCardIndex: cardIndex,
        }));
      }
    } else {
      // For waste and foundation, only move the top card
      e.dataTransfer.setData('text/plain', JSON.stringify({
        cards: [card],
        sourcePile: pileType,
        sourcePileIndex: pileIndex,
      }));
    }
  }, [gameState]);

  const handleCardDragEnd = useCallback((e: React.DragEvent) => {
    // Reset any drag-related state if needed
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetPileType: 'tableau' | 'waste' | 'foundation', targetPileIndex: number) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { cards: draggedCards, sourcePile, sourcePileIndex, sourceCardIndex } = data;

    if (!draggedCards[0].isFaceUp) return;

    // Handle different move types
    if (targetPileType === 'foundation') {
      // Only allow moving a single card to foundation
      if (draggedCards.length === 1) {
        const foundation = gameState.foundations[targetPileIndex];
        if (Deck.canPlaceCardOnFoundation(draggedCards[0], foundation.cards)) {
          moveCardToFoundation(sourcePile, sourcePileIndex, targetPileIndex);
        }
      }
    } else if (targetPileType === 'tableau') {
      const targetColumn = gameState.tableau[targetPileIndex];
      if (targetColumn.cards.length === 0) {
        if (draggedCards[0].rank === 'K') {
          moveCardsToTableau(draggedCards, sourcePile, sourcePileIndex, targetPileIndex, sourceCardIndex);
        }
      } else {
        const targetCard = targetColumn.cards[targetColumn.cards.length - 1];
        if (Deck.canPlaceCardOnTableau(draggedCards[0], targetCard)) {
          moveCardsToTableau(draggedCards, sourcePile, sourcePileIndex, targetPileIndex, sourceCardIndex);
        }
      }
    }
  }, [gameState]);

  const drawCards = useCallback(() => {
    const newState = JSON.parse(JSON.stringify(gameState));
    
    if (newState.stock.length === 0) {
      // If stock is empty, recycle waste pile
      newState.stock = [...newState.waste].reverse();
      newState.waste = [];
    } else {
      // Draw one card from stock and turn it face up
      const drawnCard = newState.stock[newState.stock.length - 1];
      drawnCard.isFaceUp = true;
      
      newState.stock = newState.stock.slice(0, -1);
      newState.waste = [...newState.waste, drawnCard];
    }
    
    updateGameState(newState);
  }, [gameState, updateGameState]);

  const renderWasteCard = useMemo(() => {
    if (gameState.waste.length === 0) return null;
    const card = gameState.waste[gameState.waste.length - 1];
    return (
      <CardContainer
        key={`waste-${gameState.waste.length - 1}`}
        card={card}
        pileType="waste"
        pileIndex={gameState.waste.length - 1}
        isSelected={gameState.selectedCard === card && gameState.selectedPile === 'waste'}
        onCardClick={handleCardClick}
        onCardDoubleClick={handleCardDoubleClick}
        onCardDragStart={handleCardDragStart}
        onCardDragEnd={handleCardDragEnd}
        isDraggable={true}
      />
    );
  }, [gameState.waste, gameState.selectedCard, gameState.selectedPile, handleCardClick, handleCardDoubleClick, handleCardDragStart, handleCardDragEnd]);

  const renderFoundationCard = useCallback((foundation: { suit: string; cards: Card[] }, index: number) => {
    if (foundation.cards.length === 0) {
      return <div className="empty-foundation" />;
    }
    const card = foundation.cards[foundation.cards.length - 1];
    return (
      <CardContainer
        key={`foundation-${index}`}
        card={card}
        pileType="foundation"
        pileIndex={index}
        isSelected={gameState.selectedCard === card && gameState.selectedPile === 'foundation'}
        onCardClick={handleCardClick}
        onCardDoubleClick={handleCardDoubleClick}
        onCardDragStart={handleCardDragStart}
        onCardDragEnd={handleCardDragEnd}
        isDraggable={true}
      />
    );
  }, [gameState.selectedCard, gameState.selectedPile, handleCardClick, handleCardDoubleClick, handleCardDragStart, handleCardDragEnd]);

  const renderTableauCard = useCallback((card: Card, columnIndex: number, cardIndex: number) => {
    return (
      <div
        key={`tableau-${columnIndex}-${cardIndex}`}
        className="tableau-card"
        style={{ marginTop: cardIndex > 0 ? (card.isFaceUp ? '-150px' : '-200px') : '0' }}
      >
        <CardContainer
          card={card}
          pileType="tableau"
          pileIndex={columnIndex}
          isSelected={gameState.selectedCard === card && gameState.selectedPile === 'tableau'}
          onCardClick={handleCardClick}
          onCardDoubleClick={handleCardDoubleClick}
          onCardDragStart={handleCardDragStart}
          onCardDragEnd={handleCardDragEnd}
          isDraggable={card.isFaceUp}
        />
      </div>
    );
  }, [gameState.selectedCard, gameState.selectedPile, handleCardClick, handleCardDoubleClick, handleCardDragStart, handleCardDragEnd]);

  return (
    <div className="game-board">
      <div className="top-section">
        <div className="stock-waste">
          <div className="stock" onClick={drawCards}>
            {gameState.stock.length > 0 && (
              <div className="card card-back" />
            )}
          </div>
          <div className="waste">
            {renderWasteCard}
          </div>
        </div>
        <div className="foundations">
          {gameState.foundations.map((foundation, index) => (
            <div
              key={`foundation-${index}`}
              className="foundation"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'foundation', index)}
            >
              {renderFoundationCard(foundation, index)}
            </div>
          ))}
        </div>
      </div>
      <div className="tableau">
        {gameState.tableau.map((column, columnIndex) => (
          <div
            key={`tableau-${columnIndex}`}
            className="tableau-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'tableau', columnIndex)}
          >
            {column.cards.length === 0 ? (
              <div className="empty-tableau" />
            ) : (
              column.cards.map((card, cardIndex) => renderTableauCard(card, columnIndex, cardIndex))
            )}
          </div>
        ))}
      </div>
      <div className="controls">
        <UndoButton 
          onClick={handleUndo}
          disabled={gameHistory.length <= 1}
        />
      </div>
    </div>
  );
};

export default GameBoard; 