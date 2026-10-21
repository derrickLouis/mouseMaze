/**
 * Tests for useAutoplay hook
 */

import { renderHook, act } from '@testing-library/react';
import useAutoplay from '../../hooks/useAutoplay';

// Advances the fake timer by the given delay, then lets any pending
// promise microtasks (e.g. the `await makeMove()` inside the hook) resolve.
async function advanceAndFlush(ms) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useAutoplay', () => {
  let makeMove;
  let isProcessingRef;
  let playIntervalRef;

  beforeEach(() => {
    jest.useFakeTimers();
    makeMove = jest.fn().mockResolvedValue(undefined);
    isProcessingRef = { current: false };
    playIntervalRef = { current: null };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('does not schedule a move when isPlaying is false', async () => {
    renderHook(() =>
      useAutoplay(false, false, makeMove, isProcessingRef, 100, playIntervalRef)
    );

    await advanceAndFlush(1000);

    expect(makeMove).not.toHaveBeenCalled();
  });

  test('does not schedule a move when the game is over', async () => {
    renderHook(() =>
      useAutoplay(true, true, makeMove, isProcessingRef, 100, playIntervalRef)
    );

    await advanceAndFlush(1000);

    expect(makeMove).not.toHaveBeenCalled();
  });

  test('calls makeMove after playSpeed elapses when playing', async () => {
    renderHook(() =>
      useAutoplay(true, false, makeMove, isProcessingRef, 100, playIntervalRef)
    );

    await advanceAndFlush(100);

    expect(makeMove).toHaveBeenCalledTimes(1);
  });

  test('chains additional moves after each one resolves', async () => {
    renderHook(() =>
      useAutoplay(true, false, makeMove, isProcessingRef, 100, playIntervalRef)
    );

    await advanceAndFlush(100);
    await advanceAndFlush(100);
    await advanceAndFlush(100);

    expect(makeMove).toHaveBeenCalledTimes(3);
  });

  test('skips calling makeMove while a move is already processing, then retries', async () => {
    isProcessingRef.current = true;

    renderHook(() =>
      useAutoplay(true, false, makeMove, isProcessingRef, 100, playIntervalRef)
    );

    await advanceAndFlush(100);
    expect(makeMove).not.toHaveBeenCalled();

    isProcessingRef.current = false;
    await advanceAndFlush(100);
    expect(makeMove).toHaveBeenCalledTimes(1);
  });

  test('clears the pending timeout on unmount', async () => {
    const { unmount } = renderHook(() =>
      useAutoplay(true, false, makeMove, isProcessingRef, 100, playIntervalRef)
    );

    expect(playIntervalRef.current).not.toBeNull();

    unmount();

    expect(playIntervalRef.current).toBeNull();

    await advanceAndFlush(1000);
    expect(makeMove).not.toHaveBeenCalled();
  });

  test('stops rescheduling once the game ends and clears the timer', async () => {
    const { rerender } = renderHook(
      ({ gameOver }) =>
        useAutoplay(true, gameOver, makeMove, isProcessingRef, 100, playIntervalRef),
      { initialProps: { gameOver: false } }
    );

    await advanceAndFlush(100);
    expect(makeMove).toHaveBeenCalledTimes(1);

    rerender({ gameOver: true });
    expect(playIntervalRef.current).toBeNull();

    await advanceAndFlush(1000);
    expect(makeMove).toHaveBeenCalledTimes(1);
  });

  test('logs and keeps scheduling when makeMove rejects', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    makeMove.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(undefined);

    renderHook(() =>
      useAutoplay(true, false, makeMove, isProcessingRef, 100, playIntervalRef)
    );

    await advanceAndFlush(100);
    expect(consoleError).toHaveBeenCalledWith('Error in makeMove:', expect.any(Error));

    await advanceAndFlush(100);
    expect(makeMove).toHaveBeenCalledTimes(2);
  });
});
