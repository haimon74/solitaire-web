import React from 'react';
import GameBoard from './components/GameBoard';
import styles from './App.module.css';
// import GenerateSolvableDecks from './GenerateSolvableDecks';

function App() {
  return (
    <div className={styles.App}>
      <header className={styles.AppHeader}>
        <h1>Klondike Solitaire</h1>
      </header>
      <main>
        <GameBoard />
        {/* <GenerateSolvableDecks /> */}
      </main>
    </div>
  );
}

export default App;
