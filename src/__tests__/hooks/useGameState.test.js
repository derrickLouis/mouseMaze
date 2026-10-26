/**
 * Tests for useGameState hook
 */

import { renderHook, act } from '@testing-library/react';
import useGameState from '../../hooks/useGameState';
import { INITIAL_POSITIONS, INITIAL_SABOTAGE_TOKENS } from '../../core/constants';

describe('useGameState', () => {
  test('starts with default player, turn, sabotage tokens and positions', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.redPos).toEqual(INITIAL_POSITIONS.RED);
    expect(result.current.bluePos).toEqual(INITIAL_POSITIONS.BLUE);
    expect(result.current.cheesePos).toEqual(INITIAL_POSITIONS.CHEESE);
    expect(result.current.currentPlayer).toBe('red');
    expect(result.current.turn).toBe(1);
    expect(result.current.sabotageTokens).toEqual({
      red: INITIAL_SABOTAGE_TOKENS,
      blue: INITIAL_SABOTAGE_TOKENS
    });
    expect(result.current.gameOver).toBe(false);
    expect(result.current.winner).toBeNull();
  });

  test('initializeMaze fills in the maze and computes starting paths', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.initializeMaze();
    });

    expect(result.current.maze.length).toBeGreaterThan(0);
    expect(result.current.currentPaths.red).not.toBeNull();
    expect(result.current.currentPaths.blue).not.toBeNull();
  });

  test('updatePlayerPosition moves the given player and resets their turnsSinceMove', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.incrementTurnsSinceMove('red');
      result.current.incrementTurnsSinceMove('red');
    });
    expect(result.current.turnsSinceMove.red).toBe(2);

    act(() => {
      result.current.updatePlayerPosition('red', { x: 2, y: 1 });
    });

    expect(result.current.redPos).toEqual({ x: 2, y: 1 });
    expect(result.current.turnsSinceMove.red).toBe(0);
    expect(result.current.bluePos).toEqual(INITIAL_POSITIONS.BLUE);
  });

  test('switchPlayer alternates turns and only increments turn after blue moves', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.switchPlayer();
    });
    expect(result.current.currentPlayer).toBe('blue');
    expect(result.current.turn).toBe(1);

    act(() => {
      result.current.switchPlayer();
    });
    expect(result.current.currentPlayer).toBe('red');
    expect(result.current.turn).toBe(2);
  });

  test('consumeSabotageToken decrements the token count and never drops below zero', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      for (let i = 0; i < INITIAL_SABOTAGE_TOKENS + 2; i++) {
        result.current.consumeSabotageToken('blue');
      }
    });

    expect(result.current.sabotageTokens.blue).toBe(0);
    expect(result.current.sabotageTokens.red).toBe(INITIAL_SABOTAGE_TOKENS);
  });

  test('handleWin records the winner, stops the game and logs the result', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.handleWin('blue');
    });

    expect(result.current.winner).toBe('blue');
    expect(result.current.gameOver).toBe(true);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.gameLog).toHaveLength(1);
    expect(result.current.gameLog[0]).toMatchObject({ type: 'system' });
    expect(result.current.gameLog[0].message).toContain('BLUE');
  });

  test('resetGame restores initial state and invokes the cleanup callback', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.updatePlayerPosition('red', { x: 3, y: 3 });
      result.current.switchPlayer();
      result.current.consumeSabotageToken('red');
      result.current.handleWin('red');
    });

    const onReset = jest.fn();
    act(() => {
      result.current.resetGame(onReset);
    });

    expect(result.current.redPos).toEqual(INITIAL_POSITIONS.RED);
    expect(result.current.bluePos).toEqual(INITIAL_POSITIONS.BLUE);
    expect(result.current.currentPlayer).toBe('red');
    expect(result.current.turn).toBe(1);
    expect(result.current.sabotageTokens).toEqual({
      red: INITIAL_SABOTAGE_TOKENS,
      blue: INITIAL_SABOTAGE_TOKENS
    });
    expect(result.current.gameOver).toBe(false);
    expect(result.current.winner).toBeNull();
    expect(result.current.gameLog).toHaveLength(0);
    expect(result.current.calculationSteps).toEqual([
      'Game reset - Ready for strategic competition!'
    ]);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  test('randomizeMaze resets game state for a freshly generated maze', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.updatePlayerPosition('blue', { x: 4, y: 4 });
      result.current.handleWin('red');
    });

    const onMazeGenerated = jest.fn();
    act(() => {
      result.current.randomizeMaze(onMazeGenerated);
    });

    expect(result.current.maze.length).toBeGreaterThan(0);
    expect(result.current.bluePos).toEqual(INITIAL_POSITIONS.BLUE);
    expect(result.current.gameOver).toBe(false);
    expect(result.current.winner).toBeNull();
    expect(result.current.calculationSteps).toEqual([
      'New maze generated - Let the strategic competition begin!'
    ]);
    expect(onMazeGenerated).toHaveBeenCalledTimes(1);
  });
});
