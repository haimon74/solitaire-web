import { Card, Rank, Suit } from '../types';

interface GameState {
  tableau: Card[][];
  foundation: Record<Suit, Card[]>;
  stock: Card[];
  waste: Card[];
}

type Move = 
  | { type: 'wasteToFoundation'; card: Card }
  | { type: 'wasteToTableau'; to: number; card: Card }
  | { type: 'tableauToFoundation'; from: number; card: Card }
  | { type: 'tableauToTableau'; from: number; to: number; card: Card; count: number }
  | { type: 'drawFromStock' };

// Constants
const MAX_SOLVER_DEPTH = 10000;
const MAX_SOLVER_TIME = 600000; // 10 minutes timeout
const PROGRESS_LOG_INTERVAL = 5000; // 5 seconds

// Heuristic Weights
const FOUNDATION_WEIGHT = -50;  // lower is better
const EXPOSE_HIDDEN_WEIGHT = -20;
const EMPTY_COLUMN_WEIGHT = -30;
const MOVE_CARD_WEIGHT = 1;

// Helper functions
function getRankValue(rank: Rank): number {
  const rankOrder: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return rankOrder.indexOf(rank) + 1;
}

function getSuitColor(suit: Suit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

function canMoveToFoundation(card: Card, foundationPile: Card[]): boolean {
  if (foundationPile.length === 0) {
    return card.rank === 'A';
  }
  const topCard = foundationPile[foundationPile.length - 1];
  return card.suit === topCard.suit && getRankValue(card.rank) === getRankValue(topCard.rank) + 1;
}

function canMoveToTableau(cards: Card[], tableauPile: Card[]): boolean {
  if (tableauPile.length === 0) {
    return cards[0].rank === 'K';
  }
  const topCard = tableauPile[tableauPile.length - 1];
  return getRankValue(cards[0].rank) === getRankValue(topCard.rank) - 1 && 
         getSuitColor(cards[0].suit) !== getSuitColor(topCard.suit);
}

function isValidTableauSequence(cards: Card[]): boolean {
  for (let i = 0; i < cards.length - 1; i++) {
    const current = cards[i];
    const next = cards[i + 1];
    if (!current.isFaceUp || !next.isFaceUp ||
        getRankValue(current.rank) !== getRankValue(next.rank) + 1 ||
        getSuitColor(current.suit) === getSuitColor(next.suit)) {
      return false;
    }
  }
  return true;
}

function isGameWon(state: GameState): boolean {
  for (const suit in state.foundation) {
    if (state.foundation[suit as Suit].length !== 13) {
      return false;
    }
  }
  return true;
}

function heuristic(state: GameState): number {
  let h = 0;
  
  // Foundation progress (negative weight - more cards is better)
  let foundationCards = 0;
  for (const suit in state.foundation) {
    foundationCards += state.foundation[suit as Suit].length;
  }
  h += FOUNDATION_WEIGHT * foundationCards;
  
  // Expose hidden cards (negative weight - fewer hidden cards is better)
  let hiddenCards = 0;
  for (const pile of state.tableau) {
    for (const card of pile) {
      if (!card.isFaceUp) hiddenCards++;
    }
  }
  h += EXPOSE_HIDDEN_WEIGHT * hiddenCards;
  
  // Empty columns (negative weight - more empty columns is better)
  const emptyColumns = state.tableau.filter(pile => pile.length === 0).length;
  h += EMPTY_COLUMN_WEIGHT * emptyColumns;
  
  // Cards in stock and waste (positive weight - fewer cards is better)
  h += MOVE_CARD_WEIGHT * (state.stock.length + state.waste.length);
  
  return h;
}

function hashState(state: GameState): string {
  const tableauHash = state.tableau.map(pile => 
    pile.map(card => `${card.rank}${card.suit}${card.isFaceUp ? '1' : '0'}`).join('')
  ).join('|');
  
  const foundationHash = Object.entries(state.foundation)
    .map(([suit, cards]) => `${suit}:${cards.length}`)
    .join(',');
  
  return `${tableauHash}|${foundationHash}|${state.stock.length}|${state.waste.length}`;
}

function getPossibleMoves(state: GameState): Move[] {
  const moves: Move[] = [];

  // 1. Foundation moves (high priority but not exclusive)
  for (let i = 0; i < 7; i++) {
    if (state.tableau[i].length > 0) {
      const card = state.tableau[i][state.tableau[i].length - 1];
      if (card.isFaceUp && canMoveToFoundation(card, state.foundation[card.suit])) {
        moves.push({ type: 'tableauToFoundation', from: i, card: { ...card } });
      }
    }
  }

  if (state.waste.length > 0) {
    const card = state.waste[state.waste.length - 1];
    if (canMoveToFoundation(card, state.foundation[card.suit])) {
      moves.push({ type: 'wasteToFoundation', card: { ...card } });
    }
  }

  // 2. Tableau to tableau (including multi-card moves)
  for (let from = 0; from < 7; from++) {
    const fromPile = state.tableau[from];
    if (fromPile.length === 0) continue;

    // Find the first face-up card in the pile
    let firstFaceUpIndex = fromPile.length - 1;
    while (firstFaceUpIndex >= 0 && fromPile[firstFaceUpIndex].isFaceUp) {
      firstFaceUpIndex--;
    }
    firstFaceUpIndex++;

    // Try moving each valid sequence
    for (let startIndex = firstFaceUpIndex; startIndex < fromPile.length; startIndex++) {
      const cardsToMove = fromPile.slice(startIndex);
      if (isValidTableauSequence(cardsToMove)) {
        for (let to = 0; to < 7; to++) {
          if (from !== to && canMoveToTableau(cardsToMove, state.tableau[to])) {
            moves.push({
              type: 'tableauToTableau',
              from,
              to,
              card: { ...cardsToMove[0] },
              count: cardsToMove.length
            });
          }
        }
      }
    }
  }

  // 3. Waste to tableau
  if (state.waste.length > 0) {
    const card = state.waste[state.waste.length - 1];
    for (let i = 0; i < 7; i++) {
      if (canMoveToTableau([card], state.tableau[i])) {
        moves.push({ type: 'wasteToTableau', to: i, card: { ...card } });
      }
    }
  }

  // 4. Draw from stock (always include this move)
  if (state.stock.length > 0) {
    moves.push({ type: 'drawFromStock' });
  }

  return moves;
}

function applyMove(state: GameState, move: Move): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;

  switch (move.type) {
    case 'wasteToFoundation':
      newState.foundation[move.card.suit].push(newState.waste.pop()!);
      break;
    case 'wasteToTableau':
      newState.tableau[move.to].push(newState.waste.pop()!);
      break;
    case 'tableauToFoundation':
      newState.foundation[move.card.suit].push(newState.tableau[move.from].pop()!);
      break;
    case 'tableauToTableau': {
      const fromPile = newState.tableau[move.from];
      const cardsToMove = fromPile.splice(fromPile.length - move.count);
      newState.tableau[move.to].push(...cardsToMove);
      break;
    }
    case 'drawFromStock':
      if (newState.stock.length > 0) {
        const card = newState.stock.pop()!;
        card.isFaceUp = true;
        newState.waste.push(card);
      } else if (newState.waste.length > 0) {
        // Recycle waste pile if stock is empty
        newState.stock = newState.waste.reverse().map(card => ({ ...card, isFaceUp: false }));
        newState.waste = [];
      }
      break;
  }

  return newState;
}

class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop()!.item;

    const result = this.heap[0].item;
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return result;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  getLength(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    const item = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority <= item.priority) break;
      this.heap[index] = this.heap[parentIndex];
      index = parentIndex;
    }
    this.heap[index] = item;
  }

  private bubbleDown(index: number): void {
    const item = this.heap[index];
    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let smallestIndex = index;

      if (leftChildIndex < this.heap.length && 
          this.heap[leftChildIndex].priority < this.heap[smallestIndex].priority) {
        smallestIndex = leftChildIndex;
      }

      if (rightChildIndex < this.heap.length && 
          this.heap[rightChildIndex].priority < this.heap[smallestIndex].priority) {
        smallestIndex = rightChildIndex;
      }

      if (smallestIndex === index) break;

      this.heap[index] = this.heap[smallestIndex];
      index = smallestIndex;
    }
    this.heap[index] = item;
  }
}

function aStarSolveGame(initialState: GameState): boolean {
  const startTime = Date.now();
  const open = new PriorityQueue<{ state: GameState; g: number }>();
  const visited = new Set<string>();

  open.enqueue({ state: initialState, g: 0 }, heuristic(initialState));

  let expanded = 0;
  let enqueued = 1;
  let maxQueue = 1;
  let lastLogTime = startTime;
  let bestHeuristic = heuristic(initialState);
  let noImprovementCount = 0;

  while (!open.isEmpty()) {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    
    // Log progress every 5 seconds
    if (elapsedTime - (lastLogTime - startTime) > PROGRESS_LOG_INTERVAL) {
      console.log(`[A*] Progress: expanded=${expanded}, enqueued=${enqueued}, visited=${visited.size}, maxQueue=${maxQueue}, bestH=${bestHeuristic}, time=${elapsedTime}ms`);
      lastLogTime = currentTime;
    }

    const current = open.dequeue();
    if (!current) break;
    const { state, g } = current;

    if (isGameWon(state)) {
      console.log(`[A*] Solved in ${elapsedTime}ms, expanded=${expanded}, enqueued=${enqueued}, visited=${visited.size}, maxQueue=${maxQueue}`);
      return true;
    }

    const stateHash = hashState(state);
    if (visited.has(stateHash)) continue;
    visited.add(stateHash);

    if (g > MAX_SOLVER_DEPTH) continue;

    expanded++;
    const moves = getPossibleMoves(state);
    
    // Sort moves by potential improvement
    moves.sort((a, b) => {
      const stateA = applyMove(state, a);
      const stateB = applyMove(state, b);
      return heuristic(stateA) - heuristic(stateB);
    });
    
    for (const move of moves) {
      const nextState = applyMove(state, move);
      const h = heuristic(nextState);
      
      // Update best heuristic seen
      if (h < bestHeuristic) {
        bestHeuristic = h;
        noImprovementCount = 0;
        console.log(`[A*] New best heuristic: ${bestHeuristic}, expanded=${expanded}, visited=${visited.size}`);
      } else {
        noImprovementCount++;
      }
      
      // Always explore the state
      open.enqueue({ state: nextState, g: g + 1 }, g + 1 + h);
      enqueued++;
    }
    
    if (open.getLength() > maxQueue) maxQueue = open.getLength();

    // Don't give up until we've explored a significant number of states
    if (expanded < 100000) continue;
  }

  console.log(`[A*] Failed after ${Date.now() - startTime}ms, expanded=${expanded}, enqueued=${enqueued}, visited=${visited.size}, maxQueue=${maxQueue}, bestH=${bestHeuristic}`);
  return false;
}

function initializeGameState(cards: Card[]): GameState {
  console.log('Initializing game state with cards:', cards.map(card => `${card.rank}${card.suit}`).join(', '));
  
  const tableau: Card[][] = [[], [], [], [], [], [], []];
  const foundation: Record<Suit, Card[]> = {
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: []
  };
  const stock: Card[] = [];
  const waste: Card[] = [];

  // Deal tableau
  let cardIndex = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = { ...cards[cardIndex++] };
      card.isFaceUp = j === i;
      tableau[i].push(card);
    }
  }

  // Add remaining cards to stock
  for (let i = cardIndex; i < cards.length; i++) {
    stock.push({ ...cards[i], isFaceUp: false });
  }

  console.log('Initialized tableau:', tableau.map(pile => pile.map(card => `${card.rank}${card.suit}${card.isFaceUp ? '↑' : '↓'}`).join(', ')));
  console.log('Initialized stock:', stock.map(card => `${card.rank}${card.suit}${card.isFaceUp ? '↑' : '↓'}`).join(', '));

  return { tableau, foundation, stock, waste };
}

function isValidInitialState(state: GameState): boolean {
  // Check if all cards are present
  const allCards = new Set<string>();
  for (const pile of state.tableau) {
    for (const card of pile) {
      const cardKey = `${card.rank}${card.suit}`;
      if (allCards.has(cardKey)) {
        console.log('Duplicate card found:', cardKey);
        return false;
      }
      allCards.add(cardKey);
    }
  }
  for (const card of state.stock) {
    const cardKey = `${card.rank}${card.suit}`;
    if (allCards.has(cardKey)) {
      console.log('Duplicate card found:', cardKey);
      return false;
    }
    allCards.add(cardKey);
  }
  if (allCards.size !== 52) {
    console.log('Missing cards. Found:', allCards.size);
    return false;
  }
  return true;
}

// Export types separately
export type { Card, Rank, Suit, GameState, Move };

// Export values
export {
  // Constants
  MAX_SOLVER_DEPTH,
  MAX_SOLVER_TIME,
  PROGRESS_LOG_INTERVAL,
  
  // Helper functions
  getRankValue,
  getSuitColor,
  canMoveToFoundation,
  canMoveToTableau,
  isValidTableauSequence,
  
  // Game logic functions
  initializeGameState,
  isValidInitialState,
  aStarSolveGame,
  
  // Move generation and validation
  getPossibleMoves,
  
  // State management
  applyMove,
  isGameWon,
  heuristic,
  hashState
}; 