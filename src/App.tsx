import React from 'react';
import GameBoard from './components/GameBoard';
import './App.css';
// import GenerateSolvableDecks from './GenerateSolvableDecks';

function App() {
  return (
    <div className="App">
      <header className="App-header">
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
