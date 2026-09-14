/**
 * Tests for Game Engine
 */

import {
  createInitialState,
  movePlayer,
  performSabotage,
  switchPlayer,
  resetGame,
  canMove,
  canSabotage,
  isForcedToMove,
  getPlayerPosition
} from '../../core/engine.js';
import { getInitialMaze } from '../../core/maze.js';
import { INITIAL_POSITIONS, INITIAL_SABOTAGE_TOKENS, CELL_TYPES } from '../../core/constants.js';

describe('Game Engine', () => {
  let initialState;
  let testMaze;

  beforeEach(() => {
    testMaze = getInitialMaze();
    initialState = createInitialState(testMaze);
  });

  describe('createInitialState', () => {
    test('creates correct initial state', () => {
      expect(initialState.redPos).toEqual(INITIAL_POSITIONS.RED);
      expect(initialState.bluePos).toEqual(INITIAL_POSITIONS.BLUE);
      expect(initialState.cheesePos).toEqual(INITIAL_POSITIONS.CHEESE);
      expect(initialState.currentPlayer).toBe('red');
      expect(initialState.turn).toBe(1);
      expect(initialState.sabotageTokens.red).toBe(INITIAL_SABOTAGE_TOKENS);
      expect(initialState.sabotageTokens.blue).toBe(INITIAL_SABOTAGE_TOKENS);
      expect(initialState.turnsSinceMove.red).toBe(0);
      expect(initialState.turnsSinceMove.blue).toBe(0);
      expect(initialState.gameOver).toBe(false);
      expect(initialState.winner).toBe(null);
    });

    test('does not mutate input maze', () => {
      const mazeCopy = testMaze.map(row => [...row]);
      createInitialState(testMaze);
      expect(testMaze).toEqual(mazeCopy);
    });
  });

  describe('movePlayer', () => {
    test('moves red player to new position', () => {
      const newPos = { x: 2, y: 1 };
      const newState = movePlayer(initialState, 'red', newPos);

      expect(newState.redPos).toEqual(newPos);
      expect(newState.redPos).not.toBe(initialState.redPos); // New object
      expect(newState.turnsSinceMove.red).toBe(0);
    });

    test('moves blue player to new position', () => {
      const newPos = { x: 7, y: 8 };
      const newState = movePlayer(initialState, 'blue', newPos);

      expect(newState.bluePos).toEqual(newPos);
      expect(newState.turnsSinceMove.blue).toBe(0);
    });

    test('detects win when player reaches cheese', () => {
      const newState = movePlayer(initialState, 'red', INITIAL_POSITIONS.CHEESE);

      expect(newState.gameOver).toBe(true);
      expect(newState.winner).toBe('red');
    });

    test('does not mutate original state', () => {
      const newPos = { x: 2, y: 1 };
      const originalPos = { ...initialState.redPos };
      movePlayer(initialState, 'red', newPos);

      expect(initialState.redPos).toEqual(originalPos);
      expect(initialState.gameOver).toBe(false);
    });

    test('returns same state if game is over', () => {
      initialState.gameOver = true;
      const newState = movePlayer(initialState, 'red', { x: 2, y: 1 });
      expect(newState).toBe(initialState);
    });
  });

  describe('performSabotage', () => {
    test('removes wall and places new wall', () => {
      const removePos = { x: 1, y: 2 };
      const placePos = { x: 3, y: 3 };

      // Ensure remove position is a wall
      testMaze[removePos.y][removePos.x] = CELL_TYPES.WALL;
      initialState.maze = testMaze.map(row => [...row]);

      const newState = performSabotage(initialState, 'red', removePos, placePos);

      expect(newState.maze[removePos.y][removePos.x]).toBe(CELL_TYPES.OPEN);
      expect(newState.maze[placePos.y][placePos.x]).toBe(CELL_TYPES.WALL);
    });

    test('consumes sabotage token', () => {
      const removePos = { x: 1, y: 2 };
      const placePos = { x: 3, y: 3 };
      
      testMaze[removePos.y][removePos.x] = CELL_TYPES.WALL;
      initialState.maze = testMaze.map(row => [...row]);

      const newState = performSabotage(initialState, 'red', removePos, placePos);

      expect(newState.sabotageTokens.red).toBe(INITIAL_SABOTAGE_TOKENS - 1);
      expect(newState.sabotageTokens.blue).toBe(INITIAL_SABOTAGE_TOKENS);
    });

    test('increments turns since move', () => {
      const removePos = { x: 1, y: 2 };
      const placePos = { x: 3, y: 3 };
      
      testMaze[removePos.y][removePos.x] = CELL_TYPES.WALL;
      initialState.maze = testMaze.map(row => [...row]);

      const newState = performSabotage(initialState, 'red', removePos, placePos);

      expect(newState.turnsSinceMove.red).toBe(1);
    });

    test('does not mutate original state', () => {
      const removePos = { x: 1, y: 2 };
      const placePos = { x: 3, y: 3 };
      const originalTokens = initialState.sabotageTokens.red;
      
      testMaze[removePos.y][removePos.x] = CELL_TYPES.WALL;
      initialState.maze = testMaze.map(row => [...row]);

      performSabotage(initialState, 'red', removePos, placePos);

      expect(initialState.sabotageTokens.red).toBe(originalTokens);
    });

    test('returns same state if no tokens', () => {
      initialState.sabotageTokens.red = 0;
      const newState = performSabotage(initialState, 'red', { x: 1, y: 2 }, { x: 3, y: 3 });
      expect(newState).toBe(initialState);
    });
  });

  describe('switchPlayer', () => {
    test('switches from red to blue', () => {
      const newState = switchPlayer(initialState);
      expect(newState.currentPlayer).toBe('blue');
      expect(initialState.currentPlayer).toBe('red');
    });

    test('switches from blue to red', () => {
      initialState.currentPlayer = 'blue';
      const newState = switchPlayer(initialState);
      expect(newState.currentPlayer).toBe('red');
    });

    test('increments turn when switching from blue', () => {
      initialState.currentPlayer = 'blue';
      initialState.turn = 5;
      const newState = switchPlayer(initialState);
      expect(newState.turn).toBe(6);
    });

    test('does not increment turn when switching from red', () => {
      initialState.turn = 5;
      const newState = switchPlayer(initialState);
      expect(newState.turn).toBe(5);
    });

    test('returns same state if game is over', () => {
      initialState.gameOver = true;
      const newState = switchPlayer(initialState);
      expect(newState).toBe(initialState);
    });
  });

  describe('resetGame', () => {
    test('resets to initial state', () => {
      initialState.turn = 10;
      initialState.gameOver = true;
      initialState.winner = 'red';

      const resetState = resetGame(testMaze);

      expect(resetState.turn).toBe(1);
      expect(resetState.gameOver).toBe(false);
      expect(resetState.winner).toBe(null);
      expect(resetState.redPos).toEqual(INITIAL_POSITIONS.RED);
      expect(resetState.bluePos).toEqual(INITIAL_POSITIONS.BLUE);
    });
  });

  describe('canMove', () => {
    test('returns true for valid open cell', () => {
      expect(canMove(initialState, 'red', { x: 2, y: 1 })).toBe(true);
    });

    test('returns false for wall', () => {
      expect(canMove(initialState, 'red', { x: 0, y: 0 })).toBe(false);
    });

    test('returns false for out of bounds', () => {
      expect(canMove(initialState, 'red', { x: -1, y: 1 })).toBe(false);
      expect(canMove(initialState, 'red', { x: 100, y: 1 })).toBe(false);
    });

    test('returns false if game is over', () => {
      initialState.gameOver = true;
      expect(canMove(initialState, 'red', { x: 2, y: 1 })).toBe(false);
    });

    test('allows moving to cheese position', () => {
      expect(canMove(initialState, 'red', INITIAL_POSITIONS.CHEESE)).toBe(true);
    });
  });

  describe('canSabotage', () => {
    test('returns true for valid sabotage', () => {
      // Use a wall that exists in the default maze (row 2: position 2,2 is a wall)
      // Row 2 (index 2): [1,0,1,0,0,1,0,0,0,1] - so x=2 is wall
      const removePos = { x: 2, y: 2 };
      // Use an open position that's not on players (1,1), (8,8) or cheese (5,4)
      const placePos = { x: 6, y: 6 }; // Should be open based on maze layout
      
      initialState.maze = testMaze.map(row => [...row]);

      expect(canSabotage(initialState, 'red', removePos, placePos)).toBe(true);
    });

    test('returns false if no tokens', () => {
      initialState.sabotageTokens.red = 0;
      expect(canSabotage(initialState, 'red', { x: 2, y: 2 }, { x: 3, y: 3 })).toBe(false);
    });

    test('returns false if remove position is not a wall', () => {
      const removePos = { x: 1, y: 1 }; // Open cell
      expect(canSabotage(initialState, 'red', removePos, { x: 3, y: 3 })).toBe(false);
    });

    test('returns false if place position is not open', () => {
      const removePos = { x: 2, y: 2 };
      const placePos = { x: 0, y: 0 }; // Wall (border)
      
      testMaze[removePos.y][removePos.x] = CELL_TYPES.WALL;
      initialState.maze = testMaze.map(row => [...row]);

      expect(canSabotage(initialState, 'red', removePos, placePos)).toBe(false);
    });

    test('returns false if trying to place wall on player', () => {
      const removePos = { x: 2, y: 2 };
      
      testMaze[removePos.y][removePos.x] = CELL_TYPES.WALL;
      initialState.maze = testMaze.map(row => [...row]);

      expect(canSabotage(initialState, 'red', removePos, INITIAL_POSITIONS.RED)).toBe(false);
      expect(canSabotage(initialState, 'red', removePos, INITIAL_POSITIONS.BLUE)).toBe(false);
    });

    test('returns false if trying to place wall on cheese', () => {
      const removePos = { x: 2, y: 2 };
      
      testMaze[removePos.y][removePos.x] = CELL_TYPES.WALL;
      initialState.maze = testMaze.map(row => [...row]);

      expect(canSabotage(initialState, 'red', removePos, INITIAL_POSITIONS.CHEESE)).toBe(false);
    });
  });

  describe('isForcedToMove', () => {
    test('returns true when threshold reached', () => {
      initialState.turnsSinceMove.red = 1;
      expect(isForcedToMove(initialState, 'red')).toBe(true);
    });

    test('returns false when below threshold', () => {
      initialState.turnsSinceMove.red = 0;
      expect(isForcedToMove(initialState, 'red')).toBe(false);
    });
  });

  describe('getPlayerPosition', () => {
    test('returns red player position', () => {
      const pos = getPlayerPosition(initialState, 'red');
      expect(pos).toEqual(INITIAL_POSITIONS.RED);
      expect(pos).not.toBe(initialState.redPos); // New object
    });

    test('returns blue player position', () => {
      const pos = getPlayerPosition(initialState, 'blue');
      expect(pos).toEqual(INITIAL_POSITIONS.BLUE);
    });
  });
});
