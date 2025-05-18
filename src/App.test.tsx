import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders game title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Klondike Solitaire/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders game controls', () => {
    render(<App />);
    expect(screen.getByText('New Game')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });
});
