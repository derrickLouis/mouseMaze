/**
 * Tests for the Controls component
 *
 * These lock in the accessible names merged in PR #11 so the refactor into
 * separate components cannot quietly drop them again.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Controls from '../../components/Controls/Controls.jsx';

const noop = () => {};

const renderControls = (overrides = {}) => {
  const props = {
    isPlaying: false,
    togglePlay: noop,
    makeMove: noop,
    resetGame: noop,
    randomizeMaze: noop,
    showPaths: true,
    setShowPaths: noop,
    isFullscreen: false,
    setIsFullscreen: noop,
    gameOver: false,
    ...overrides
  };
  render(<Controls {...props} />);
  return props;
};

describe('Controls', () => {
  describe('accessible names', () => {
    it('exposes every control to the accessibility tree', () => {
      renderControls();

      expect(screen.getByRole('button', { name: 'Auto Play' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Step' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'New Maze' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hide paths' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Full Screen' })).toBeInTheDocument();
    });

    it('groups the controls under a single labelled region', () => {
      renderControls();
      expect(screen.getByRole('group', { name: 'Game controls' })).toBeInTheDocument();
    });

    it('names the play button for its next action, not its current state', () => {
      renderControls({ isPlaying: true });
      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Auto Play' })).not.toBeInTheDocument();
    });
  });

  describe('toggle state', () => {
    it('reports the path overlay as pressed when paths are shown', () => {
      renderControls({ showPaths: true });
      expect(screen.getByRole('button', { name: 'Hide paths' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('reports the path overlay as unpressed and renames it when paths are hidden', () => {
      renderControls({ showPaths: false });
      const toggle = screen.getByRole('button', { name: 'Show paths' });
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('reports fullscreen state through aria-pressed', () => {
      renderControls({ isFullscreen: true });
      const toggle = screen.getByRole('button', { name: 'Exit Full Screen' });
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('behaviour', () => {
    it('disables Step once the game is over', () => {
      renderControls({ gameOver: true });
      expect(screen.getByRole('button', { name: 'Step' })).toBeDisabled();
    });

    it('leaves Step enabled while the game is in progress', () => {
      renderControls({ gameOver: false });
      expect(screen.getByRole('button', { name: 'Step' })).toBeEnabled();
    });

    it('does not fire makeMove when Step is clicked after game over', async () => {
      const makeMove = jest.fn();
      renderControls({ gameOver: true, makeMove });

      await userEvent.click(screen.getByRole('button', { name: 'Step' }));

      expect(makeMove).not.toHaveBeenCalled();
    });

    it('fires each handler from its own button', async () => {
      const togglePlay = jest.fn();
      const makeMove = jest.fn();
      const resetGame = jest.fn();
      const randomizeMaze = jest.fn();
      renderControls({ togglePlay, makeMove, resetGame, randomizeMaze });

      await userEvent.click(screen.getByRole('button', { name: 'Auto Play' }));
      await userEvent.click(screen.getByRole('button', { name: 'Step' }));
      await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
      await userEvent.click(screen.getByRole('button', { name: 'New Maze' }));

      expect(togglePlay).toHaveBeenCalledTimes(1);
      expect(makeMove).toHaveBeenCalledTimes(1);
      expect(resetGame).toHaveBeenCalledTimes(1);
      expect(randomizeMaze).toHaveBeenCalledTimes(1);
    });

    it('flips showPaths when the overlay toggle is clicked', async () => {
      const setShowPaths = jest.fn();
      renderControls({ showPaths: true, setShowPaths });

      await userEvent.click(screen.getByRole('button', { name: 'Hide paths' }));

      expect(setShowPaths).toHaveBeenCalledWith(false);
    });
  });
});
