import { Card, Rank, Suit, TableauColumn } from '../types';
import { generateSolvableDeck } from './generateSolvableDeck';
// import createSolvabilityWorker from '../workers/solvabilityWorker';  // Removed since solver is disabled

export interface GameState {
  tableau: Card[][];
  foundation: Record<Suit, Card[]>;
  stock: Card[];
  waste: Card[];
}

export type Move =
  | { type: 'wasteToFoundation'; card: Card }
  | { type: 'wasteToTableau'; to: number; card: Card }
  | { type: 'tableauToFoundation'; from: number; card: Card }
  | { type: 'tableauToTableau'; from: number; to: number; card: Card; count: number }
  | { type: 'foundationToTableau'; suit: Suit; to: number; card: Card }
  | { type: 'drawFromStock' };

// interface MockWorker {
//   postMessage: (data: any) => void;
//   onmessage: ((event: { data: { result: boolean } }) => void) | null;
//   terminate: () => void;
// }

/* Worker creation module removed - Solver functionality has been disabled
 * To re-enable worker creation:
 * 1. Uncomment this module
 * 2. Restore the worker import
 * 3. Re-enable the worker functionality in the Deck class
 */
/*
const workerModule = {
  createWorker: (): Worker => {
    if (process.env.NODE_ENV === 'test') {
      const MockWorker = require('../__mocks__/workerMock').MockWorker;
      return new MockWorker();
    }
    return createSolvabilityWorker();
  }
};
*/

// Track active workers to prevent duplicates
// const activeWorkers = new Set<Worker>();  // Removed since solver is disabled

export class Deck {
  private static readonly MAX_SOLVER_TIME = 5000; // 5 seconds
  private static readonly MAX_SOLVER_DEPTH = 100;

  private cards: Card[] = [];
  private shuffleSound: HTMLAudioElement;
  // private worker: Worker | null = null;  // Comment out worker-related properties
  // private workerId: string | null = null;
  // private isWorkerReady = false;
  private hasUserInteracted: boolean = false;
  private isInitialized: boolean = false;
  // private solutionPath: Move[] = [];  // Comment out solver-related properties
  // private isCheckingSolvability: boolean = false;
  // private solvabilityCallback: ((isSolvable: boolean) => void) | null = null;

  constructor() {
    console.log('Initializing new deck...');
    this.cards = generateSolvableDeck();
    this.shuffleSound = new Audio('/assets/audio/riffle-card-shuffle.mp3');
    this.isInitialized = true;  // Set initialized immediately since we're not checking solvability

    // Add event listener for user interaction
    document.addEventListener('click', () => {
      this.hasUserInteracted = true;
    }, { once: true });
  }

  public onGameReady(callback: (isSolvable: boolean) => void): void {
    if (!this.isInitialized) {
      throw new Error('Deck is not initialized');
    }

    /* SOLVABILITY CHECK DISABLED
     * To re-enable solvability checking:
     * 1. Uncomment the worker-related properties above
     * 2. Uncomment the initializeWorker() call in constructor
     * 3. Restore this method to its original implementation
     * 4. Uncomment the cleanup code in cleanup() method
     */
    
    // Always return true for now since solvability check is disabled
    callback(true);
  }

  public cleanup() {
    // Only cleanup audio resources since worker is disabled
    this.shuffleSound.pause();
    this.shuffleSound.src = '';
  }

  public destroy(): void {
    this.cleanup();
  }

  private createDeck(): Card[] {
    return generateSolvableDeck();
  }

  private performShuffle(playSound: boolean): void {
    // Play sound only if requested and user has interacted
    if (playSound && this.hasUserInteracted) {
      this.shuffleSound.currentTime = 0;
      try {
        this.shuffleSound.play();
      } catch (error) {
        console.warn('Failed to play shuffle sound:', error);
      }
    }

    // Use the smart shuffle
    this.cards = generateSolvableDeck();
    
    // Log the final state for debugging
    console.log('Smart shuffled cards:', this.cards.map(card => card ? `${card.rank}${card.suit}` : 'undefined').join(', '));
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

  public static canPlaceCardOnTableau(card: Card, targetCard: Card | null): boolean {
    // Handle empty pile case
    if (targetCard === null) {
      return card.rank === 'K' && card.isFaceUp;
    }

    // Both cards must be face up
    if (!card.isFaceUp || !targetCard.isFaceUp) {
      return false;
    }

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
    // Card being placed must be face up
    if (!card.isFaceUp) {
      return false;
    }

    if (foundationPile.length === 0) {
      return card.rank === 'A';
    }

    const rankOrder: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const topCard = foundationPile[foundationPile.length - 1];
    
    // Top card must be face up
    if (!topCard.isFaceUp) {
      return false;
    }
    
    return (
      card.suit === topCard.suit &&
      rankOrder.indexOf(card.rank) === rankOrder.indexOf(topCard.rank) + 1
    );
  }

  public getCards(): Card[] {
    // Remove solvability check since it's disabled
    return this.cards;
  }

  public isLoading(): boolean {
    // Always return false since solvability check is disabled
    return false;
  }
} 