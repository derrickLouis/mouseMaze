/**
 * Tests for the StatsPanel component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatsPanel from '../../components/SidePanel/StatsPanel.jsx';

describe('StatsPanel', () => {
  it('renders the turns-since-move counts for both players', () => {
    render(<StatsPanel turnsSinceMove={{ red: 2, blue: 0 }} showPaths={false} />);

    expect(screen.getByText('Turns Since Move (Red):')).toBeInTheDocument();
    expect(screen.getByText('Turns Since Move (Blue):')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('highlights a player turn count in yellow once they have skipped a move', () => {
    render(<StatsPanel turnsSinceMove={{ red: 1, blue: 0 }} showPaths={false} />);

    expect(screen.getByText('1')).toHaveClass('text-yellow-400');
    expect(screen.getByText('0')).toHaveClass('text-green-400');
  });

  it('shows path visualization as ON when enabled', () => {
    render(<StatsPanel turnsSinceMove={{ red: 0, blue: 0 }} showPaths={true} />);

    const status = screen.getByText('ON');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('text-green-400');
  });

  it('shows path visualization as OFF when disabled', () => {
    render(<StatsPanel turnsSinceMove={{ red: 0, blue: 0 }} showPaths={false} />);

    const status = screen.getByText('OFF');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('text-gray-500');
  });
});
