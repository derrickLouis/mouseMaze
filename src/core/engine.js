/**
 * Game Engine
 * Pure game logic - no React dependencies
 * Manages game state and provides actions that return new immutable state
 */

import {
  INITIAL_POSITIONS,
  INITIAL_SABOTAGE_TOKENS,
  MAX_MOVES_PER_TURN,
  FORCED_MOVE_THRESHOLD,
  CELL_TYPES
} from './constants.js';
import { isValidMove } from './maze.js';

/**
 * Create initial game state
 * @param {number[][]} maze - The initial maze
 * @returns {Object} Initial game state
 */
export function createInitialState(maze) {
  return {
    maze: maze,
    redPos: { ...INITIAL_POSITIONS.RED },
    bluePos: { ...INITIAL_POSITIONS.BLUE },
    cheesePos: { ...INITIAL_POSITIONS.CHEESE },
    currentPlayer: 'red',
    turn: 1,
    sabotageTokens: {
      red: INITIAL_SABOTAGE_TOKENS,
      blue: INITIAL_SABOTAGE_TOKENS
    },
    turnsSinceMove: {
      red: 0,
      blue: 0
    },
    gameOver: false,
    winner: null
  };
}

/**
 * Move a player to a new position
 * @param {Object} state - Current game state
 * @param {string} player - 'red' or 'blue'
 * @param {Object} newPos - New position {x, y}
 * @returns {Object} New game state
 */
export function movePlayer(state, player, newPos) {
  if (state.gameOver) return state;

  const newState = { ...state };
  newState.maze = state.maze.map(row => [...row]);
  
  // Update player position
  if (player === 'red') {
    newState.redPos = { ...newPos };
  } else {
    newState.bluePos = { ...newPos };
  }

  // Reset turns since move
  newState.turnsSinceMove = {
    ...state.turnsSinceMove,
    [player]: 0
  };

  // Check for win
  const cheesePos = state.cheesePos;
  if (newPos.x === cheesePos.x && newPos.y === cheesePos.y) {
    newState.gameOver = true;
    newState.winner = player;
  }

  return newState;
}

/**
 * Perform a sabotage action (remove wall, place wall)
 * @param {Object} state - Current game state
 * @param {string} player - 'red' or 'blue'
 * @param {Object} removePos - Position to remove wall from {x, y}
 * @param {Object} placePos - Position to place wall at {x, y}
 * @returns {Object} New game state
 */
export function performSabotage(state, player, removePos, placePos) {
  if (state.gameOver) return state;
  if (state.sabotageTokens[player] <= 0) return state;

  const newState = { ...state };
  newState.maze = state.maze.map(row => [...row]);
  
  // Remove wall
  newState.maze[removePos.y][removePos.x] = CELL_TYPES.OPEN;
  // Place wall
  newState.maze[placePos.y][placePos.x] = CELL_TYPES.WALL;

  // Consume token and increment turns since move
  newState.sabotageTokens = {
    ...state.sabotageTokens,
    [player]: state.sabotageTokens[player] - 1
  };
  newState.turnsSinceMove = {
    ...state.turnsSinceMove,
    [player]: state.turnsSinceMove[player] + 1
  };

  return newState;
}

/**
 * Switch to the next player
 * @param {Object} state - Current game state
 * @returns {Object} New game state
 */
export function switchPlayer(state) {
  if (state.gameOver) return state;

  const newState = { ...state };
  newState.currentPlayer = state.currentPlayer === 'red' ? 'blue' : 'red';
  
  // Increment turn when blue's turn ends
  if (state.currentPlayer === 'blue') {
    newState.turn = state.turn + 1;
  }

  return newState;
}

/**
 * Reset game to initial state
 * @param {number[][]} maze - The maze to reset to
 * @returns {Object} Initial game state
 */
export function resetGame(maze) {
  return createInitialState(maze);
}

/**
 * Check if a player can move to a position
 * @param {Object} state - Current game state
 * @param {string} player - 'red' or 'blue'
 * @param {Object} pos - Position to check {x, y}
 * @returns {boolean} True if valid move
 */
export function canMove(state, player, pos) {
  if (state.gameOver) return false;
  if (!isValidMove(pos, state.maze)) return false;

  // Can't move to position occupied by other player
  const otherPlayer = player === 'red' ? 'blue' : 'red';
  const otherPos = state[otherPlayer === 'red' ? 'redPos' : 'bluePos'];
  if (pos.x === otherPos.x && pos.y === otherPos.y) return false;

  // Can't move to cheese position (should already be handled, but safety check)
  const cheesePos = state.cheesePos;
  if (pos.x === cheesePos.x && pos.y === cheesePos.y) {
    // Actually, moving to cheese is allowed (and wins)
    return true;
  }

  return true;
}

/**
 * Check if a player can perform a sabotage
 * @param {Object} state - Current game state
 * @param {string} player - 'red' or 'blue'
 * @param {Object} removePos - Position to remove wall from {x, y}
 * @param {Object} placePos - Position to place wall at {x, y}
 * @returns {boolean} True if valid sabotage
 */
export function canSabotage(state, player, removePos, placePos) {
  if (state.gameOver) return false;
  if (state.sabotageTokens[player] <= 0) return false;

  // Remove position must be a wall (and not border)
  if (state.maze[removePos.y][removePos.x] !== CELL_TYPES.WALL) return false;
  if (removePos.x === 0 || removePos.x === state.maze[0].length - 1 ||
      removePos.y === 0 || removePos.y === state.maze.length - 1) {
    return false; // Can't remove border walls
  }

  // Place position must be open (and not on players/cheese)
  if (state.maze[placePos.y][placePos.x] !== CELL_TYPES.OPEN) return false;
  
  const redPos = state.redPos;
  const bluePos = state.bluePos;
  const cheesePos = state.cheesePos;

  if ((placePos.x === redPos.x && placePos.y === redPos.y) ||
      (placePos.x === bluePos.x && placePos.y === bluePos.y) ||
      (placePos.x === cheesePos.x && placePos.y === cheesePos.y)) {
    return false; // Can't place wall on players or cheese
  }

  return true;
}

/**
 * Check if player is forced to move (hasn't moved recently)
 * @param {Object} state - Current game state
 * @param {string} player - 'red' or 'blue'
 * @returns {boolean} True if forced to move
 */
export function isForcedToMove(state, player) {
  return state.turnsSinceMove[player] >= FORCED_MOVE_THRESHOLD;
}

/**
 * Get player position
 * @param {Object} state - Current game state
 * @param {string} player - 'red' or 'blue'
 * @returns {Object} Position {x, y}
 */
export function getPlayerPosition(state, player) {
  return player === 'red' ? { ...state.redPos } : { ...state.bluePos };
}
