import { Deck, GameState } from './Deck';
import { Card, Suit, Rank, TableauColumn } from '../types';

// Mock worker implementation
const mockWorker = {
  postMessage: jest.fn(),
  onmessage: null,
  terminate: jest.fn()
};

// Mock the generateSolvableDeck function
jest.mock('./generateSolvableDeck', () => ({
  generateSolvableDeck: jest.fn().mockReturnValue([])
}));

// Mock the worker creation
jest.mock('../workers/solvabilityWorker', () => ({
  default: () => mockWorker
}));

describe('Deck', () => {
  let deck: Deck;

  beforeEach(() => {
    jest.clearAllMocks();
    deck = new Deck();
  });

  it('should create a deck instance', () => {
    expect(deck).toBeDefined();
  });

  it('should always return true for onGameReady', () => {
    const callback = jest.fn();
    deck.onGameReady(callback);
    expect(callback).toHaveBeenCalledWith(true);
  });

  describe('canPlaceCardOnTableau', () => {
    it('should allow placing a red queen on a black king', () => {
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(queen, king)).toBe(true);
    });

    it('should not allow placing a red queen on a red king', () => {
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const king: Card = { rank: 'K', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(queen, king)).toBe(false);
    });

    it('should not allow placing a red queen on a black jack', () => {
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const jack: Card = { rank: 'J', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(queen, jack)).toBe(false);
    });

    it('should not allow placing a queen on an empty tableau pile', () => {
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(queen, null)).toBe(false);
    });

    it('should allow placing a king on an empty tableau pile', () => {
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(king, null)).toBe(true);
    });

    it('should allow placing a black jack on a red queen', () => {
      const jack: Card = { rank: 'J', suit: 'clubs', isFaceUp: true };
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(jack, queen)).toBe(true);
    });

    it('should not allow placing a hearts queen on a diamonds king', () => {
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const king: Card = { rank: 'K', suit: 'diamonds', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(queen, king)).toBe(false);
    });

    it('should allow placing a black queen on a red king', () => {
      const queen: Card = { rank: 'Q', suit: 'spades', isFaceUp: true };
      const king: Card = { rank: 'K', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(queen, king)).toBe(true);
    });

    it('should not allow placing a queen on another queen', () => {
      const queen1: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const queen2: Card = { rank: 'Q', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(queen1, queen2)).toBe(false);
    });

    it('should allow placing a black ten on a red jack', () => {
      const ten: Card = { rank: '10', suit: 'clubs', isFaceUp: true };
      const jack: Card = { rank: 'J', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(ten, jack)).toBe(true);
    });

    it('should not allow placing a nine on a jack', () => {
      const nine: Card = { rank: '9', suit: 'clubs', isFaceUp: true };
      const jack: Card = { rank: 'J', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(nine, jack)).toBe(false);
    });

    it('should allow placing a red ace on a black two', () => {
      const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
      const two: Card = { rank: '2', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(ace, two)).toBe(true);
    });

    it('should not allow placing a two on an ace', () => {
      const two: Card = { rank: '2', suit: 'hearts', isFaceUp: true };
      const ace: Card = { rank: 'A', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(two, ace)).toBe(false);
    });

    it('should allow placing a black seven on a red eight', () => {
      const seven: Card = { rank: '7', suit: 'clubs', isFaceUp: true };
      const eight: Card = { rank: '8', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(seven, eight)).toBe(true);
    });

    it('should not allow placing a card on a face-down card', () => {
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: false };
      expect(Deck.canPlaceCardOnTableau(queen, king)).toBe(false);
    });

    it('should not allow placing a face-down card on another card', () => {
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: false };
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(queen, king)).toBe(false);
    });

    it('should allow placing a red three on a black four', () => {
      const three: Card = { rank: '3', suit: 'hearts', isFaceUp: true };
      const four: Card = { rank: '4', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(three, four)).toBe(true);
    });
  });

  describe('canPlaceCardOnFoundation', () => {
    it('should allow placing an ace on an empty foundation pile', () => {
      const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(ace, [])).toBe(true);
    });

    it('should not allow placing a non-ace on an empty foundation pile', () => {
      const two: Card = { rank: '2', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(two, [])).toBe(false);
    });

    it('should allow placing a two on an ace of the same suit', () => {
      const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
      const two: Card = { rank: '2', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(two, [ace])).toBe(true);
    });

    it('should not allow placing a two on an ace of a different suit', () => {
      const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
      const two: Card = { rank: '2', suit: 'diamonds', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(two, [ace])).toBe(false);
    });

    it('should allow placing a king on a queen of the same suit', () => {
      const queen: Card = { rank: 'Q', suit: 'spades', isFaceUp: true };
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(king, [queen])).toBe(true);
    });

    it('should not allow placing a jack on a queen', () => {
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const jack: Card = { rank: 'J', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(jack, [queen])).toBe(false);
    });

    it('should not allow placing a three on a two of a different suit', () => {
      const two: Card = { rank: '2', suit: 'clubs', isFaceUp: true };
      const three: Card = { rank: '3', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(three, [two])).toBe(false);
    });

    it('should allow placing a ten on a nine of the same suit', () => {
      const nine: Card = { rank: '9', suit: 'diamonds', isFaceUp: true };
      const ten: Card = { rank: '10', suit: 'diamonds', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(ten, [nine])).toBe(true);
    });

    it('should not allow placing a face-down card on a foundation pile', () => {
      const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
      const two: Card = { rank: '2', suit: 'hearts', isFaceUp: false };
      expect(Deck.canPlaceCardOnFoundation(two, [ace])).toBe(false);
    });

    it('should not allow placing a card on a face-down card in foundation', () => {
      const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: false };
      const two: Card = { rank: '2', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(two, [ace])).toBe(false);
    });

    it('should not allow placing a card beyond King', () => {
      const king: Card = { rank: 'K', suit: 'hearts', isFaceUp: true };
      const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(ace, [king])).toBe(false);
    });

    it('should not allow placing a card that skips ranks', () => {
      const two: Card = { rank: '2', suit: 'hearts', isFaceUp: true };
      const four: Card = { rank: '4', suit: 'hearts', isFaceUp: true };
      expect(Deck.canPlaceCardOnFoundation(four, [two])).toBe(false);
    });

    it('should allow moving a card from foundation to tableau', () => {
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      expect(Deck.canPlaceCardOnTableau(queen, king)).toBe(true);
    });

    it('should not allow moving a card between foundation piles', () => {
      const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
      const two: Card = { rank: '2', suit: 'hearts', isFaceUp: true };
      const three: Card = { rank: '3', suit: 'hearts', isFaceUp: true };
      // Try to move the two from one foundation to another
      expect(Deck.canPlaceCardOnFoundation(two, [three])).toBe(false);
    });
  });

  describe('dealTableau', () => {
    let deck: Deck;
    let mockCards: Card[];

    beforeEach(() => {
      // Create a predictable deck for testing
      mockCards = [];
      // Create 28 cards (7 columns, 1-7 cards each) in a predictable order
      // Each column will have cards of the same suit for easier testing
      const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades', 'hearts', 'diamonds', 'clubs'];
      const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      
      for (let i = 0; i < 28; i++) {
        const columnIndex = Math.floor(i / 7); // Which column this card goes to
        const cardIndex = i % 7; // Position within column
        const suit = suits[columnIndex];
        const rank = ranks[cardIndex];
        mockCards.push({ rank, suit, isFaceUp: false });
      }

      // Create a new deck and inject our mock cards
      deck = new Deck();
      // @ts-ignore - accessing private property for testing
      deck.cards = [...mockCards];
    });

    it('should return an array of 7 tableau columns', () => {
      const tableau = deck.dealTableau();
      expect(tableau).toHaveLength(7);
      tableau.forEach(column => {
        expect(column).toHaveProperty('cards');
        expect(Array.isArray(column.cards)).toBe(true);
      });
    });

    it('should have correct number of cards in each column', () => {
      const tableau = deck.dealTableau();
      tableau.forEach((column, index) => {
        expect(column.cards).toHaveLength(index + 1);
      });
    });

    it('should have only the top card face up in each column', () => {
      const tableau = deck.dealTableau();
      tableau.forEach((column, columnIndex) => {
        const cards = column.cards;
        // All cards except the last one should be face down
        cards.slice(0, -1).forEach(card => {
          expect(card.isFaceUp).toBe(false);
        });
        // The last card should be face up
        expect(cards[cards.length - 1].isFaceUp).toBe(true);
      });
    });

    it('should maintain card properties when dealing', () => {
      const tableau = deck.dealTableau();
      let deckIndex = 0;
      tableau.forEach((column, columnIndex) => {
        column.cards.forEach((card, cardIndex) => {
          const expectedCard = mockCards[deckIndex++];
          expect(card.rank).toBe(expectedCard.rank);
          expect(card.suit).toBe(expectedCard.suit);
        });
      });
    });

    it('should not modify the original deck', () => {
      const originalCards = [...mockCards];
      deck.dealTableau();
      // @ts-ignore - accessing private property for testing
      expect(deck.cards).toEqual(originalCards);
    });

    it('should return a new array each time', () => {
      const firstDeal = deck.dealTableau();
      const secondDeal = deck.dealTableau();
      expect(firstDeal).not.toBe(secondDeal); // Different array reference
      expect(firstDeal).toEqual(secondDeal); // Same contents
    });
  });

  describe('getRemainingCards', () => {
    beforeEach(() => {
      // Mock the cards array to have a predictable order for testing
      const mockCards: Card[] = [];
      // Create 52 cards in a predictable order
      for (let i = 0; i < 52; i++) {
        const rank = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][i % 13] as Rank;
        const suit = ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(i / 13) % 4] as Suit;
        mockCards.push({ rank, suit, isFaceUp: false });
      }
      // @ts-ignore - accessing private property for testing
      deck.cards = mockCards;
    });

    it('should return exactly 24 cards (remaining after tableau)', () => {
      const remainingCards = deck.getRemainingCards();
      expect(remainingCards).toHaveLength(24);
    });

    it('should return cards starting from index 28', () => {
      const remainingCards = deck.getRemainingCards();
      // First card should be the 29th card (index 28) from the deck
      const firstCard = remainingCards[0];
      const expectedRank = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][28 % 13];
      const expectedSuit = ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(28 / 13) % 4];
      expect(firstCard.rank).toBe(expectedRank);
      expect(firstCard.suit).toBe(expectedSuit);
    });

    it('should return all cards face down', () => {
      const remainingCards = deck.getRemainingCards();
      remainingCards.forEach(card => {
        expect(card.isFaceUp).toBe(false);
      });
    });

    it('should return a new array each time', () => {
      const firstCall = deck.getRemainingCards();
      const secondCall = deck.getRemainingCards();
      expect(firstCall).not.toBe(secondCall); // Different array reference
      expect(firstCall).toEqual(secondCall); // Same contents
    });

    it('should maintain card properties in returned cards', () => {
      const remainingCards = deck.getRemainingCards();
      remainingCards.forEach((card, index) => {
        const deckIndex = index + 28; // Cards start from index 28
        const expectedRank = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][deckIndex % 13];
        const expectedSuit = ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(deckIndex / 13) % 4];
        expect(card.rank).toBe(expectedRank);
        expect(card.suit).toBe(expectedSuit);
      });
    });
  });

  /* SOLVER AND MOVE VALIDATION TESTS DISABLED - Solver functionality has been disabled
   * To re-enable these tests:
   * 1. Uncomment these test blocks
   * 2. Restore the solver methods in Deck.ts:
   *    - getPossibleMoves
   *    - applyMove
   *    - isGameWon
   *    - and other solver-related methods
   * 3. Re-enable the worker functionality
   */
  /*
  describe('move validation', () => {
    let deck: Deck;
    let mockState: GameState;

    beforeEach(() => {
      deck = new Deck();
      mockState = {
        tableau: [[], [], [], [], [], [], []],
        foundation: {
          hearts: [],
          diamonds: [],
          clubs: [],
          spades: []
        },
        stock: [],
        waste: []
      };
    });

    describe('foundation moves', () => {
      it('should allow moving an ace to an empty foundation pile', () => {
        const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
        mockState.waste = [ace];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({ type: 'wasteToFoundation', card: ace });
      });

      it('should allow moving a two on an ace of the same suit', () => {
        const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
        const two: Card = { rank: '2', suit: 'hearts', isFaceUp: true };
        mockState.foundation.hearts = [ace];
        mockState.waste = [two];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({ type: 'wasteToFoundation', card: two });
      });

      it('should not allow moving a two on an ace of different suit', () => {
        const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
        const two: Card = { rank: '2', suit: 'diamonds', isFaceUp: true };
        mockState.foundation.hearts = [ace];
        mockState.waste = [two];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).not.toContainEqual({ type: 'wasteToFoundation', card: two });
      });

      it('should not allow moving a face-down card to foundation', () => {
        const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: false };
        mockState.waste = [ace];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).not.toContainEqual({ type: 'wasteToFoundation', card: ace });
      });
    });

    describe('tableau moves', () => {
      it('should allow moving a king to an empty tableau pile', () => {
        const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
        mockState.waste = [king];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({ type: 'wasteToTableau', to: 0, card: king });
      });

      it('should allow moving a black queen on a red king', () => {
        const king: Card = { rank: 'K', suit: 'hearts', isFaceUp: true };
        const queen: Card = { rank: 'Q', suit: 'spades', isFaceUp: true };
        mockState.tableau[0] = [king];
        mockState.waste = [queen];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({ type: 'wasteToTableau', to: 0, card: queen });
      });

      it('should not allow moving a red queen on a red king', () => {
        const king: Card = { rank: 'K', suit: 'hearts', isFaceUp: true };
        const queen: Card = { rank: 'Q', suit: 'diamonds', isFaceUp: true };
        mockState.tableau[0] = [king];
        mockState.waste = [queen];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).not.toContainEqual({ type: 'wasteToTableau', to: 0, card: queen });
      });

      it('should not allow moving a face-down card to tableau', () => {
        const king: Card = { rank: 'K', suit: 'spades', isFaceUp: false };
        mockState.waste = [king];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).not.toContainEqual({ type: 'wasteToTableau', to: 0, card: king });
      });

      it('should not allow moving a card on a face-down card', () => {
        const king: Card = { rank: 'K', suit: 'spades', isFaceUp: false };
        const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
        mockState.tableau[0] = [king];
        mockState.waste = [queen];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).not.toContainEqual({ type: 'wasteToTableau', to: 0, card: queen });
      });

      it.skip('should allow moving a sequence of cards to tableau', () => {
        const king: Card = { rank: 'K', suit: 'hearts', isFaceUp: true };
        const queen: Card = { rank: 'Q', suit: 'spades', isFaceUp: true };
        const jack: Card = { rank: 'J', suit: 'hearts', isFaceUp: true };
        mockState.tableau[0] = [king];
        mockState.tableau[1] = [queen, jack];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({ 
          type: 'tableauToTableau', 
          from: 1, 
          to: 0, 
          card: { rank: 'Q', suit: 'hearts', isFaceUp: true },
          count: 2  // Moving Q♥ and J♣
        });
      });
    });

    describe('stock and waste moves', () => {
      it('should allow drawing from stock when waste is empty', () => {
        const card: Card = { rank: 'A', suit: 'hearts', isFaceUp: false };
        mockState.stock = [card];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({ type: 'drawFromStock' });
      });

      it('should allow drawing from stock when waste has cards', () => {
        const stockCard: Card = { rank: 'A', suit: 'hearts', isFaceUp: false };
        const wasteCard: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
        mockState.stock = [stockCard];
        mockState.waste = [wasteCard];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({ type: 'drawFromStock' });
      });

      it('should not allow drawing from empty stock', () => {
        mockState.stock = [];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).not.toContainEqual({ type: 'drawFromStock' });
      });

      it('should turn drawn cards face up', () => {
        const card: Card = { rank: 'A', suit: 'hearts', isFaceUp: false };
        mockState.stock = [card];
        const newState = deck['applyMove'](mockState, { type: 'drawFromStock' });
        expect(newState.waste[0].isFaceUp).toBe(true);
      });

      it('should keep stock cards face down', () => {
        const card1: Card = { rank: 'A', suit: 'hearts', isFaceUp: false };
        const card2: Card = { rank: '2', suit: 'hearts', isFaceUp: false };
        mockState.stock = [card1, card2];
        const newState = deck['applyMove'](mockState, { type: 'drawFromStock' });
        expect(newState.stock[0].isFaceUp).toBe(false);
      });

      it('should move drawn card from stock to waste', () => {
        const card: Card = { rank: 'A', suit: 'hearts', isFaceUp: false };
        mockState.stock = [card];
        const newState = deck['applyMove'](mockState, { type: 'drawFromStock' });
        expect(newState.stock).toHaveLength(0);
        expect(newState.waste).toHaveLength(1);
        expect(newState.waste[0].rank).toBe('A');
        expect(newState.waste[0].suit).toBe('hearts');
      });
    });
  });

  describe('tableau sequence moves', () => {
    let deck: Deck;
    let mockState: GameState;

    beforeEach(() => {
      deck = new Deck();
      mockState = {
        tableau: [[], [], [], [], [], [], []],
        foundation: {
          hearts: [],
          diamonds: [],
          clubs: [],
          spades: []
        },
        stock: [],
        waste: []
      };
    });

    it('should allow moving a valid sequence of cards', () => {
      // Create a valid sequence: K♠, Q♥, J♣ (alternating colors, descending order)
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const jack: Card = { rank: 'J', suit: 'clubs', isFaceUp: true };
      
      mockState.tableau[0] = [king];
      mockState.tableau[1] = [queen, jack];
      
      const moves = deck['getPossibleMoves'](mockState);
      expect(moves).toContainEqual({ 
        type: 'tableauToTableau', 
        from: 1, 
        to: 0, 
        card: { rank: 'Q', suit: 'hearts', isFaceUp: true },
        count: 2  // Moving Q♥ and J♣
      });
    });

    it('should not allow moving an invalid sequence (same color)', () => {
      // Create an invalid sequence: K♠, Q♣ (same color)
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      const queen: Card = { rank: 'Q', suit: 'clubs', isFaceUp: true };
      
      mockState.tableau[0] = [king];
      mockState.tableau[1] = [queen];
      
      const moves = deck['getPossibleMoves'](mockState);
      expect(moves).not.toContainEqual({ 
        type: 'tableauToTableau', 
        from: 1, 
        to: 0, 
        card: queen 
      });
    });

    it('should not allow moving an invalid sequence (non-descending order)', () => {
      // Create an invalid sequence: K♠, J♥ (skipping Q)
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      const jack: Card = { rank: 'J', suit: 'hearts', isFaceUp: true };
      
      mockState.tableau[0] = [king];
      mockState.tableau[1] = [jack];
      
      const moves = deck['getPossibleMoves'](mockState);
      expect(moves).not.toContainEqual({ 
        type: 'tableauToTableau', 
        from: 1, 
        to: 0, 
        card: jack 
      });
    });

    it('should not allow moving a sequence with face-down cards', () => {
      // Create a sequence with a face-down card: K♠, Q♥(face-down), J♣
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: false };
      const jack: Card = { rank: 'J', suit: 'clubs', isFaceUp: true };
      
      mockState.tableau[0] = [king];
      mockState.tableau[1] = [queen, jack];
      
      const moves = deck['getPossibleMoves'](mockState);
      expect(moves).not.toContainEqual({ 
        type: 'tableauToTableau', 
        from: 1, 
        to: 0, 
        card: queen 
      });
    });

    it('should allow moving a sequence to an empty tableau pile if starting with King', () => {
      // Create a valid sequence starting with King: K♠, Q♥, J♣
      const king: Card = { rank: 'K', suit: 'spades', isFaceUp: true };
      const queen: Card = { rank: 'Q', suit: 'hearts', isFaceUp: true };
      const jack: Card = { rank: 'J', suit: 'clubs', isFaceUp: true };
      
      mockState.tableau[0] = [king, queen, jack];
      
      const moves = deck['getPossibleMoves'](mockState);
      expect(moves).toContainEqual({ 
        type: 'tableauToTableau', 
        from: 0, 
        to: 1, 
        card: { rank: 'K', suit: 'spades', isFaceUp: true },
        count: 3  // Moving K♠, Q♥, and J♣
      });
    });
  });

  describe('game state validation and edge cases', () => {
    let deck: Deck;
    let mockState: GameState;

    beforeEach(() => {
      deck = new Deck();
      mockState = {
        tableau: [[], [], [], [], [], [], []],
        foundation: {
          hearts: [],
          diamonds: [],
          clubs: [],
          spades: []
        },
        stock: [],
        waste: []
      };
    });

    describe('win condition', () => {
      it('should detect a winning state when all foundation piles are complete', () => {
        // Fill all foundation piles with complete suits
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        suits.forEach(suit => {
          mockState.foundation[suit] = ranks.map(rank => ({ rank, suit, isFaceUp: true }));
        });

        expect(deck['isGameWon'](mockState)).toBe(true);
      });

      it('should not detect a win when foundation piles are incomplete', () => {
        // Fill hearts foundation with all cards except King
        const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q'];
        mockState.foundation.hearts = ranks.map(rank => ({ rank, suit: 'hearts', isFaceUp: true }));
        
        expect(deck['isGameWon'](mockState)).toBe(false);
      });

      it('should not detect a win when any foundation pile has face-down cards', () => {
        // Fill hearts foundation with all cards, but one face-down
        const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        mockState.foundation.hearts = ranks.map((rank, index) => ({
          rank,
          suit: 'hearts',
          isFaceUp: index !== 5 // Make the 6 face-down
        }));
        
        expect(deck['isGameWon'](mockState)).toBe(false);
      });
    });

    describe('stock recycling', () => {
      it('should allow recycling waste to stock when stock is empty', () => {
        // Set up state with empty stock and cards in waste
        const wasteCards: Card[] = [
          { rank: 'A', suit: 'hearts', isFaceUp: true },
          { rank: '2', suit: 'hearts', isFaceUp: true }
        ];
        mockState.waste = wasteCards;
        mockState.stock = [];

        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({ type: 'drawFromStock' });
      });

      it('should turn waste cards face down when recycling to stock', () => {
        // Set up state with cards in waste
        const wasteCards: Card[] = [
          { rank: 'A', suit: 'hearts', isFaceUp: true },
          { rank: '2', suit: 'hearts', isFaceUp: true }
        ];
        mockState.waste = wasteCards;
        mockState.stock = [];

        // Simulate recycling by drawing from empty stock
        const newState = deck['applyMove'](mockState, { type: 'drawFromStock' });
        expect(newState.stock.every(card => !card.isFaceUp)).toBe(true);
      });
    });

    describe('partial sequence moves', () => {
      it('should allow moving a partial sequence if it forms a valid sequence', () => {
        // Create a sequence: K♠, Q♥, J♣, 10♦, 9♠
        const cards: Card[] = [
          { rank: 'K', suit: 'spades', isFaceUp: true },
          { rank: 'Q', suit: 'hearts', isFaceUp: true },
          { rank: 'J', suit: 'clubs', isFaceUp: true },
          { rank: '10', suit: 'diamonds', isFaceUp: true },
          { rank: '9', suit: 'spades', isFaceUp: true }
        ];
        
        mockState.tableau[0] = cards;
        // Place a J♠ as the target card (valid for the 10♦ to be placed on)
        mockState.tableau[1] = [{ rank: 'J', suit: 'spades', isFaceUp: true }];
        
        const moves = deck['getPossibleMoves'](mockState);
        // Should allow moving 10♦, 9♠ to the J♠ (valid sequence: J♠, 10♦, 9♠)
        expect(moves).toContainEqual({
          type: 'tableauToTableau',
          from: 0,
          to: 1,
          card: { rank: '10', suit: 'diamonds', isFaceUp: true },
          count: 2
        });
      });

      it('should not allow moving a partial sequence that breaks tableau rules', () => {
        // Create a sequence: K♠, Q♥, J♣, 10♦, 9♠
        const cards: Card[] = [
          { rank: 'K', suit: 'spades', isFaceUp: true },
          { rank: 'Q', suit: 'hearts', isFaceUp: true },
          { rank: 'J', suit: 'clubs', isFaceUp: true },
          { rank: '10', suit: 'diamonds', isFaceUp: true },
          { rank: '9', suit: 'spades', isFaceUp: true }
        ];
        
        mockState.tableau[0] = cards;
        mockState.tableau[1] = [{ rank: '7', suit: 'spades', isFaceUp: true }]; // Same suit as 9♠
        
        const moves = deck['getPossibleMoves'](mockState);
        // Should not allow moving the sequence to 7♠ (same suit)
        expect(moves).not.toContainEqual({
          type: 'tableauToTableau',
          from: 0,
          to: 1,
          card: { rank: 'K', suit: 'spades', isFaceUp: true },
          count: 3
        });
      });
    });
  });

  describe('additional edge cases', () => {
    let deck: Deck;
    let mockState: GameState;

    beforeEach(() => {
      deck = new Deck();
      mockState = {
        tableau: [[], [], [], [], [], [], []],
        foundation: {
          hearts: [],
          diamonds: [],
          clubs: [],
          spades: []
        },
        stock: [],
        waste: []
      };
    });

    describe('stock and waste edge cases', () => {
      it('should handle drawing multiple cards from stock', () => {
        // Set up stock with multiple cards
        const stockCards: Card[] = [
          { rank: 'A', suit: 'hearts', isFaceUp: false },
          { rank: '2', suit: 'hearts', isFaceUp: false },
          { rank: '3', suit: 'hearts', isFaceUp: false }
        ];
        mockState.stock = stockCards;

        // Draw first card
        let newState = deck['applyMove'](mockState, { type: 'drawFromStock' });
        expect(newState.stock).toHaveLength(2);
        expect(newState.waste).toHaveLength(1);
        expect(newState.waste[0].isFaceUp).toBe(true);

        // Draw second card
        newState = deck['applyMove'](newState, { type: 'drawFromStock' });
        expect(newState.stock).toHaveLength(1);
        expect(newState.waste).toHaveLength(2);
        expect(newState.waste[1].isFaceUp).toBe(true);
      });

      it('should maintain waste card order when recycling to stock', () => {
        // Set up waste with cards in specific order
        const wasteCards: Card[] = [
          { rank: 'A', suit: 'hearts', isFaceUp: true },
          { rank: '2', suit: 'hearts', isFaceUp: true },
          { rank: '3', suit: 'hearts', isFaceUp: true }
        ];
        mockState.waste = wasteCards;

        // Recycle waste to stock
        const newState = deck['applyMove'](mockState, { type: 'drawFromStock' });
        expect(newState.stock).toHaveLength(3);
        expect(newState.waste).toHaveLength(0);
        // Cards should be in reverse order and face down
        expect(newState.stock[0].rank).toBe('3');
        expect(newState.stock[1].rank).toBe('2');
        expect(newState.stock[2].rank).toBe('A');
        expect(newState.stock.every(card => !card.isFaceUp)).toBe(true);
      });
    });

    describe('foundation pile edge cases', () => {
      it('should not allow moving cards between foundation piles', () => {
        // Set up foundation with some cards
        mockState.foundation.hearts = [
          { rank: 'A', suit: 'hearts', isFaceUp: true },
          { rank: '2', suit: 'hearts', isFaceUp: true }
        ];
        mockState.foundation.diamonds = [
          { rank: 'A', suit: 'diamonds', isFaceUp: true }
        ];

        const moves = deck['getPossibleMoves'](mockState);
        // Should not find any moves from foundation to foundation
        expect(moves.every(move => 
          move.type !== 'tableauToFoundation' || 
          !mockState.foundation[move.card.suit].includes(move.card)
        )).toBe(true);
      });

      it('should allow moving cards from foundation to tableau if valid', () => {
        // Set up foundation with a card that can be moved to tableau
        mockState.foundation.hearts = [
          { rank: 'A', suit: 'hearts', isFaceUp: true },
          { rank: '2', suit: 'hearts', isFaceUp: true },
          { rank: '3', suit: 'hearts', isFaceUp: true }
        ];
        // Set up tableau with a valid target card (4♠)
        mockState.tableau[0] = [
          { rank: '4', suit: 'spades', isFaceUp: true }
        ];

        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({
          type: 'foundationToTableau',
          suit: 'hearts',
          to: 0,
          card: { rank: '3', suit: 'hearts', isFaceUp: true }
        });
      });
    });

    describe('tableau sequence edge cases', () => {
      it('should not allow moving a King onto any face-up card', () => {
        // Create a sequence starting with King: K♠, Q♥, J♣
        const cards: Card[] = [
          { rank: 'K', suit: 'spades', isFaceUp: true },
          { rank: 'Q', suit: 'hearts', isFaceUp: true },
          { rank: 'J', suit: 'clubs', isFaceUp: true }
        ];
        
        // Try to place K♠ on 2♥ (invalid: K is higher than 2)
        mockState.tableau[0] = cards;
        mockState.tableau[1] = [
          { rank: '3', suit: 'spades', isFaceUp: false }, // Face-down card
          { rank: '2', suit: 'hearts', isFaceUp: true }   // Invalid target for K♠
        ];
        
        const moves = deck['getPossibleMoves'](mockState);
        // Should not find any moves that place K♠ on 2♥
        expect(moves).not.toContainEqual({
          type: 'tableauToTableau',
          from: 0,
          to: 1,
          card: { rank: 'K', suit: 'spades', isFaceUp: true },
          count: 3
        });
      });

      it('should allow moving a valid sequence onto a King', () => {
        // Create a sequence: Q♥, J♣, 10♦ (valid sequence that can be placed on K♠)
        const cards: Card[] = [
          { rank: 'Q', suit: 'hearts', isFaceUp: true },
          { rank: 'J', suit: 'clubs', isFaceUp: true },
          { rank: '10', suit: 'diamonds', isFaceUp: true }
        ];
        
        // Place K♠ as the target card (valid for Q♥ to be placed on)
        mockState.tableau[0] = cards;
        mockState.tableau[1] = [
          { rank: 'K', suit: 'spades', isFaceUp: true }   // Valid target for Q♥
        ];
        
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({
          type: 'tableauToTableau',
          from: 0,
          to: 1,
          card: { rank: 'Q', suit: 'hearts', isFaceUp: true },
          count: 3  // Moving Q♥, J♣, 10♦
        });
      });
    });
  });
  */

  /* SOLVER TESTS DISABLED - Solver functionality has been disabled
   * To re-enable solver tests:
   * 1. Uncomment these test blocks
   * 2. Restore the solver methods in Deck.ts
   * 3. Re-enable the worker functionality
   */
  /*
  describe('Solver functionality', () => {
    describe('getPossibleMoves', () => {
      let deck: Deck;
      let mockState: GameState;

      beforeEach(() => {
        deck = new Deck();
        mockState = {
          tableau: [[], [], [], [], [], [], []],
          foundation: {
            hearts: [],
            diamonds: [],
            clubs: [],
            spades: []
          },
          stock: [],
          waste: []
        };
      });

      it('should allow moving Ace from waste to foundation', () => {
        const ace: Card = { rank: 'A', suit: 'hearts', isFaceUp: true };
        mockState.waste = [ace];
        const moves = deck['getPossibleMoves'](mockState);
        expect(moves).toContainEqual({ type: 'wasteToFoundation', card: ace });
      });

      // ... rest of the solver tests ...
    });

    describe('isSolvable', () => {
      // ... solver tests ...
    });

    describe('solveGame', () => {
      // ... solver tests ...
    });
  });
  */
}); 