/**
 * Tests for the FullscreenView component
 *
 * The fullscreen board used to be a second copy of the grid, tokens and winner
 * overlay inlined in MouseMaze.jsx. These cover the extracted component so the
 * two views cannot drift apart again.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FullscreenView from '../../components/FullscreenView/FullscreenView.jsx';
import { MAZE_SIZE, INITIAL_SABOTAGE_TOKENS } from '../../core/constants';

const emptyMaze = Array(MAZE_SIZE)
  .fill()
  .map(() => Array(MAZE_SIZE).fill(0));

const noop = () => {};

const renderView = (overrides = {}) => {
  const props = {
    maze: emptyMaze,
    getCellClass: () => 'cell',
    getCellContent: () => '',
    renderPathDot: () => [],
    sabotageTokens: { red: INITIAL_SABOTAGE_TOKENS, blue: INITIAL_SABOTAGE_TOKENS },
    isPlaying: false,
    togglePlay: noop,
    winner: null,
    resetGame: noop,
    randomizeMaze: noop,
    onExit: noop,
    ...overrides
  };
  render(<FullscreenView {...props} />);
  return props;
};

describe('FullscreenView', () => {
  it('presents itself as a labelled modal dialog', () => {
    renderView();
    const dialog = screen.getByRole('dialog', { name: 'Fullscreen board' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders the shared MazeGrid rather than a private copy', () => {
    renderView();
    expect(screen.getByRole('grid', { name: 'Maze board' })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(MAZE_SIZE * MAZE_SIZE);
  });

  it('gives the exit and play buttons accessible names', () => {
    renderView();
    expect(screen.getByRole('button', { name: 'Exit Full Screen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Auto Play' })).toBeInTheDocument();
  });

  it('calls onExit when the exit button is clicked', async () => {
    const onExit = jest.fn();
    renderView({ onExit });

    await userEvent.click(screen.getByRole('button', { name: 'Exit Full Screen' }));

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('calls onExit when Escape is pressed', async () => {
    const onExit = jest.fn();
    renderView({ onExit });

    await userEvent.keyboard('{Escape}');

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('stops listening for Escape once unmounted', async () => {
    const onExit = jest.fn();
    const { unmount } = render(
      <FullscreenView
        maze={emptyMaze}
        getCellClass={() => 'cell'}
        getCellContent={() => ''}
        renderPathDot={() => []}
        sabotageTokens={{ red: 3, blue: 3 }}
        isPlaying={false}
        togglePlay={noop}
        winner={null}
        resetGame={noop}
        randomizeMaze={noop}
        onExit={onExit}
      />
    );

    unmount();
    await userEvent.keyboard('{Escape}');

    expect(onExit).not.toHaveBeenCalled();
  });

  it('announces each side’s remaining sabotage tokens', () => {
    renderView({ sabotageTokens: { red: 2, blue: 0 } });

    expect(
      screen.getByRole('status', { name: `Red sabotage tokens: 2 of ${INITIAL_SABOTAGE_TOKENS} remaining` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: `Blue sabotage tokens: 0 of ${INITIAL_SABOTAGE_TOKENS} remaining` })
    ).toBeInTheDocument();
  });

  it('hides the winner overlay while the game is running', () => {
    renderView({ winner: null });
    expect(screen.queryByText(/MOUSE WINS!/i)).not.toBeInTheDocument();
  });

  it('shows the shared winner overlay when there is a winner', () => {
    renderView({ winner: 'red' });
    expect(screen.getByText('RED MOUSE WINS!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play Again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New Maze' })).toBeInTheDocument();
  });
});
