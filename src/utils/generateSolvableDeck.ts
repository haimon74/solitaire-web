import { Card, Rank, Suit } from '../types';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random positions for kings (one per column, ensuring they're at the start of columns)
function getRandomKingPositions(count: number): number[] {
  const positions = Array.from({ length: 7 }, (_, i) => i * 7); // All possible king positions (start of each column)
  return shuffleArray(positions).slice(0, count); // Shuffle and take the first 'count' positions
}

// Get random positions within the stock pile (positions 28-51)
function getRandomStockPositions(count: number): number[] {
  const positions = Array.from({ length: 24 }, (_, i) => i + 28); // All possible stock positions (28-51)
  return shuffleArray(positions).slice(0, count); // Shuffle and take the first 'count' positions
}

function generateSolvableDeck(): Card[] {
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  // const redSuits: Suit[] = ['hearts', 'diamonds'];
  // const blackSuits: Suit[] = ['clubs', 'spades'];

  // Create all 52 cards and shuffle them
  const allCards: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      allCards.push({ suit, rank, isFaceUp: false });
    }
  }
  const shuffledCards = shuffleArray(allCards);

  // Create a Set to track used cards
  const usedCards = new Set<string>();

  // Helper function to get next unused card
  function getNextUnusedCard(cards: Card[]): Card | undefined {
    for (const card of cards) {
      const cardKey = card.rank + card.suit;
      if (!usedCards.has(cardKey)) {
        usedCards.add(cardKey);
        return card;
      }
    }
    return undefined;
  }

  // Separate cards by type from the shuffled deck
  const aces = shuffledCards.filter(card => card.rank === 'A');
  const lowCards = shuffledCards.filter(card => ['2', '3', '4'].includes(card.rank));
  const kings = shuffledCards.filter(card => card.rank === 'K');
  const remainingCards = shuffledCards.filter(card => 
    !['A', '2', '3', '4', 'K'].includes(card.rank)
  );

  // Create the deck array
  const deck: Card[] = new Array(52);

  // Place kings in random tableau positions (one per column, at the start)
  const kingPositions = getRandomKingPositions(Math.min(kings.length, 7));
  kingPositions.forEach((pos, index) => {
    const king = getNextUnusedCard(kings);
    if (king) {
      deck[pos] = { ...king, isFaceUp: true };
    }
  });

  // Place low cards (2s-4s) in early tableau positions
  let lowCardIndex = 0;
  for (let col = 0; col < 4 && lowCardIndex < lowCards.length; col++) {
    for (let row = 1; row <= 3 && lowCardIndex < lowCards.length; row++) {
      const pos = col * 7 + row;
      if (!deck[pos]) {
        const lowCard = getNextUnusedCard(lowCards);
        if (lowCard) {
          deck[pos] = { ...lowCard, isFaceUp: false };
          lowCardIndex++;
        }
      }
    }
  }

  // Place aces in random positions within the stock pile (positions 28-51)
  const acePositions = getRandomStockPositions(aces.length);
  acePositions.forEach((pos, index) => {
    const ace = getNextUnusedCard(aces);
    if (ace) {
      deck[pos] = { ...ace, isFaceUp: false };
    }
  });

  // Fill remaining positions with the rest of the cards
  let remainingIndex = 0;
  for (let i = 0; i < deck.length; i++) {
    if (!deck[i]) {
      const card = getNextUnusedCard(remainingCards);
      if (card) {
        const isInTableau = i < 28;
        const isTopCard = isInTableau && (i % 7 === Math.floor(i / 7));
        deck[i] = { ...card, isFaceUp: isTopCard };
        remainingIndex++;
      } else {
        console.error('Not enough cards to fill deck:', {
          position: i,
          usedCards: usedCards.size,
          remainingCards: remainingCards.length - remainingIndex
        });
        // Regenerate the deck if we run out of cards
        return generateSolvableDeck();
      }
    }
  }

  // Validate deck before returning
  const validCards = deck.filter(card => 
    card && 
    typeof card.rank === 'string' && 
    typeof card.suit === 'string' &&
    ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].includes(card.rank) &&
    ['hearts', 'diamonds', 'clubs', 'spades'].includes(card.suit)
  );

  if (validCards.length !== 52 || usedCards.size !== 52) {
    console.error('Invalid deck generated:', {
      totalCards: deck.length,
      validCards: validCards.length,
      usedCards: usedCards.size,
      invalidCards: deck.filter(card => !validCards.includes(card))
    });
    // Regenerate the deck if invalid
    return generateSolvableDeck();
  }

  // Ensure all stock pile cards are face down
  for (let i = 28; i < deck.length; i++) {
    if (deck[i]) {
      deck[i] = { ...deck[i], isFaceUp: false };
    }
  }

  return deck;
}

export { generateSolvableDeck }; 