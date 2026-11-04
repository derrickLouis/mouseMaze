/**
 * Tests for the WinnerOverlay component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WinnerOverlay from '../../components/WinnerOverlay/WinnerOverlay.jsx';

describe('WinnerOverlay', () => {
  it('renders nothing when there is no winner', () => {
    const { container } = render(
      <WinnerOverlay winner={null} resetGame={() => {}} randomizeMaze={() => {}} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('announces the winning mouse in uppercase', () => {
    render(<WinnerOverlay winner="red" resetGame={() => {}} randomizeMaze={() => {}} />);

    expect(screen.getByText('RED MOUSE WINS!')).toBeInTheDocument();
  });

  it('calls resetGame when "Play Again" is clicked', () => {
    const resetGame = jest.fn();
    render(<WinnerOverlay winner="blue" resetGame={resetGame} randomizeMaze={() => {}} />);

    fireEvent.click(screen.getByText('Play Again'));

    expect(resetGame).toHaveBeenCalledTimes(1);
  });

  it('calls randomizeMaze when "New Maze" is clicked', () => {
    const randomizeMaze = jest.fn();
    render(<WinnerOverlay winner="blue" resetGame={() => {}} randomizeMaze={randomizeMaze} />);

    fireEvent.click(screen.getByText('New Maze'));

    expect(randomizeMaze).toHaveBeenCalledTimes(1);
  });
});
