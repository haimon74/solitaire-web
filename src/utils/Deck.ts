import { Card, Rank, Suit, TableauColumn } from '../types';

export class Deck {
  private cards: Card[];

  constructor() {
    this.cards = this.createDeck();
    this.shuffle();
  }

  private createDeck(): Card[] {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank, isFaceUp: false });
      }
    }

    return deck;
  }

  private shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public dealTableau(): TableauColumn[] {
    const tableau: TableauColumn[] = [];
    let cardIndex = 0;

    for (let i = 0; i < 7; i++) {
      const column: Card[] = [];
      for (let j = 0; j <= i; j++) {
        const card = this.cards[cardIndex++];
        card.isFaceUp = j === i; // Only the top card is face up
        column.push(card);
      }
      tableau.push({ cards: column });
    }

    return tableau;
  }

  public getRemainingCards(): Card[] {
    return this.cards.slice(28); // Return the remaining 24 cards
  }

  public static canPlaceCardOnTableau(card: Card, targetCard: Card): boolean {
    const rankOrder: Rank[] = ['K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
    const cardRankIndex = rankOrder.indexOf(card.rank);
    const targetRankIndex = rankOrder.indexOf(targetCard.rank);

    const isRed = (suit: Suit) => suit === 'hearts' || suit === 'diamonds';
    const isBlack = (suit: Suit) => suit === 'clubs' || suit === 'spades';

    return (
      cardRankIndex === targetRankIndex + 1 &&
      ((isRed(card.suit) && isBlack(targetCard.suit)) ||
        (isBlack(card.suit) && isRed(targetCard.suit)))
    );
  }

  public static canPlaceCardOnFoundation(card: Card, foundationPile: Card[]): boolean {
    if (foundationPile.length === 0) {
      return card.rank === 'A';
    }

    const rankOrder: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const topCard = foundationPile[foundationPile.length - 1];
    
    return (
      card.suit === topCard.suit &&
      rankOrder.indexOf(card.rank) === rankOrder.indexOf(topCard.rank) + 1
    );
  }
} 