import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing autoplay functionality
 * Handles interval-based automatic game progression with proper cleanup
 * Uses setTimeout chain instead of setInterval to wait for async makeMove completion
 * 
 * @param {boolean} isPlaying - Whether autoplay is active
 * @param {boolean} gameOver - Whether the game has ended
 * @param {Function} makeMove - Function to execute a game move (must return Promise)
 * @param {Object} isProcessingRef - Ref to track if move is in progress
 * @param {number} playSpeed - Delay between moves in milliseconds
 * @param {Object} playIntervalRef - Ref to store timeout ID for cleanup
 */
export default function useAutoplay(isPlaying, gameOver, makeMove, isProcessingRef, playSpeed, playIntervalRef) {

  useEffect(() => {
    // Don't start autoplay if game is over or not playing
    if (!isPlaying || gameOver) {
      if (playIntervalRef.current) {
        clearTimeout(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      return;
    }

    // Schedule next move using setTimeout chain for better control
    const scheduleNextMove = () => {
      if (!isPlaying || gameOver) {
        return;
      }

      playIntervalRef.current = setTimeout(async () => {
        // Only proceed if not already processing and still playing
        if (isProcessingRef.current || !isPlaying || gameOver) {
          scheduleNextMove(); // Retry after delay
          return;
        }

        try {
          await makeMove();
        } catch (error) {
          console.error('Error in makeMove:', error);
        } finally {
          // Schedule next move only if still playing and not processing
          if (isPlaying && !gameOver) {
            scheduleNextMove();
          }
        }
      }, playSpeed);
    };

    // Start the first move
    scheduleNextMove();

    // Cleanup function
    return () => {
      if (playIntervalRef.current) {
        clearTimeout(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, gameOver, playSpeed, makeMove, isProcessingRef]);

  return {
    playIntervalRef
  };
}
