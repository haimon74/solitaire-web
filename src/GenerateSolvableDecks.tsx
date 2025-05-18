import React, { useState } from 'react';
import { Deck } from './utils/Deck';

const NUM_SHUFFLES = 2;

const GenerateSolvableDecks: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [decks, setDecks] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    setIsGenerating(true);
    const foundDecks: any[] = [];
    let attempts = 0;
    while (foundDecks.length < NUM_SHUFFLES) {
      attempts++;
      const deck = new Deck();
      // Wait for the deck to be solvable
      await new Promise<void>(resolve => {
        deck.onGameReady((isSolvable) => {
          if (isSolvable) {
            foundDecks.push(deck.getCards().map(card => ({ suit: card.suit, rank: card.rank })));
            setProgress(foundDecks.length);
            setDecks([...foundDecks]);
          }
          resolve();
        });
      });
    }
    setIsGenerating(false);
    // Print the decks to the console for copy-paste
    // eslint-disable-next-line no-console
    console.log('PRECOMPUTED_SOLVABLE_DECKS =', JSON.stringify(foundDecks, null, 2));
    alert('Done! Check the console for the decks.');
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Generate 2 Solvable Klondike Decks</h2>
      <button onClick={generate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Start'}
      </button>
      <div style={{ marginTop: 20 }}>
        {isGenerating && <p>Progress: {progress} / {NUM_SHUFFLES}</p>}
        {decks.length > 0 && (
          <pre style={{ maxHeight: 300, overflow: 'auto', background: '#eee', padding: 10 }}>
            {JSON.stringify(decks, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default GenerateSolvableDecks;