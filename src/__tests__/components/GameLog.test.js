/**
 * Tests for the GameLog component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameLog from '../../components/SidePanel/GameLog.jsx';

describe('GameLog', () => {
  it('shows a placeholder when there are no log entries', () => {
    render(<GameLog gameLog={[]} />);

    expect(screen.getByText('Game events will appear here...')).toBeInTheDocument();
  });

  it('renders each log entry with its turn number and message', () => {
    const gameLog = [
      { turn: 1, type: 'red', message: 'Red moved north' },
      { turn: 2, type: 'blue', message: 'Blue moved east' },
    ];
    render(<GameLog gameLog={gameLog} />);

    expect(screen.getByText('Turn 1:')).toBeInTheDocument();
    expect(screen.getByText('Red moved north')).toBeInTheDocument();
    expect(screen.getByText('Turn 2:')).toBeInTheDocument();
    expect(screen.getByText('Blue moved east')).toBeInTheDocument();
  });

  it('colors a red entry distinctly from a blue entry', () => {
    const gameLog = [
      { turn: 1, type: 'red', message: 'Red event' },
      { turn: 2, type: 'blue', message: 'Blue event' },
    ];
    render(<GameLog gameLog={gameLog} />);

    expect(screen.getByText('Red event')).toHaveClass('border-red-700');
    expect(screen.getByText('Blue event')).toHaveClass('border-blue-700');
  });

  it('falls back to the yellow styling for any other entry type', () => {
    const gameLog = [{ turn: 3, type: 'sabotage', message: 'A wall vanished' }];
    render(<GameLog gameLog={gameLog} />);

    expect(screen.getByText('A wall vanished')).toHaveClass('border-yellow-700');
  });
});
