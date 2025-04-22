export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
}

export interface TableauColumn {
  cards: Card[];
}

export interface FoundationPile {
  suit: Suit;
  cards: Card[];
}

export interface GameState {
  tableau: TableauColumn[];
  stock: Card[];
  waste: Card[];
  foundations: FoundationPile[];
  selectedCard: Card | null;
  selectedPile: 'tableau' | 'waste' | 'foundation' | null;
  selectedPileIndex: number | null;
}

export type PileType = 'tableau' | 'waste' | 'foundation' | 'stock'; 