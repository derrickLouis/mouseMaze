/**
 * Game Constants
 * Central location for all magic numbers and configuration values
 */

// Maze Configuration
export const MAZE_SIZE = 10;
export const WALL_DENSITY = 0.35;
export const CELL_TYPES = {
  OPEN: 0,
  WALL: 1
};

// Initial Positions
export const INITIAL_POSITIONS = {
  RED: { x: 1, y: 1 },
  BLUE: { x: 8, y: 8 },
  CHEESE: { x: 5, y: 4 }
};

// Game Rules
export const INITIAL_SABOTAGE_TOKENS = 3;
export const MAX_MOVES_PER_TURN = 2;
export const FORCED_MOVE_THRESHOLD = 1;
export const INITIAL_TURN = 1;

// Speed/Speed Control
export const DEFAULT_SPEED_MS = 2500;
export const MIN_SPEED_MS = 500;
export const MAX_SPEED_MS = 5000;
export const SPEED_SLIDER_STEP = 100;
export const SPEED_CALC_OFFSET = 5500; // Used in speed slider calculation: 5500 - playSpeed

// Visualization
export const VISUALIZATION_DELAY_MIN = 20;
export const VISUALIZATION_DELAY_MAX = 200;
export const VISUALIZATION_SPEED_FACTOR = 0.4;
export const VISUALIZATION_BASE_DELAY = 100;

// Pathfinding
export const NO_PATH_DISTANCE = 999; // Fallback when path doesn't exist
export const DIRECTIONS = [
  { x: 0, y: 1 },   // Down
  { x: 1, y: 0 },   // Right
  { x: 0, y: -1 },  // Up
  { x: -1, y: 0 }   // Left
];

// Sabotage Evaluation
export const MAX_SABOTAGE_EVALUATIONS = 200;
export const SABOTAGE_SCORING = {
  SELF_BENEFIT_WEIGHT: 3,
  OPPONENT_HARM_WEIGHT: 2,
  SABOTAGE_ADVANTAGE_MULTIPLIER: 0.8,
  MOVE_PREFERENCE_THRESHOLD: 1,
  ALGORITHM_BONUS: {
    ASTAR: 2,      // A* is predictable, easier to sabotage
    DFS: -1        // DFS is unpredictable, harder to sabotage
  },
  CONTEXT_BONUS: {
    OPPONENT_CLOSE_TO_WIN_DISTANCE: 3,
    OPPONENT_CLOSE_TO_WIN_BONUS: 5,
    PLAYER_BEHIND_THRESHOLD: 2,
    PLAYER_BEHIND_BONUS: 3,
    ENDGAME_TOKEN_THRESHOLD: 2,
    ENDGAME_DISTANCE_THRESHOLD: 6,
    ENDGAME_BONUS: 2
  }
};

// Default Algorithm Settings
export const DEFAULT_ALGORITHMS = {
  RED: 'bfs',
  BLUE: 'astar'
};
