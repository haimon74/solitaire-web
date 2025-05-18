import { Card } from '../types';
import { generateSolvableDeck } from './generateSolvableDeck';

describe('generateSolvableDeck', () => {
  let deck: Card[];

  beforeEach(() => {
    deck = generateSolvableDeck();
  });

  it('generates a valid deck of 52 cards', () => {
    expect(deck.length).toBe(52);
  });
}); 