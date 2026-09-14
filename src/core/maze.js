/**
 * Maze Generation and Validation
 * Pure functions for creating and validating mazes
 */

import {
  MAZE_SIZE,
  WALL_DENSITY,
  CELL_TYPES,
  INITIAL_POSITIONS
} from './constants.js';

/**
 * Generate a random maze with guaranteed paths
 * @returns {number[][]} 2D array representing the maze (0 = open, 1 = wall)
 */
export function generateRandomMaze() {
  const borderMax = MAZE_SIZE - 1;
  const newMaze = Array(MAZE_SIZE).fill().map((_, y) => 
    Array(MAZE_SIZE).fill().map((_, x) => {
      // Border walls
      if (x === 0 || x === borderMax || y === 0 || y === borderMax) {
        return CELL_TYPES.WALL;
      }
      // Random interior with configured wall density
      return Math.random() < WALL_DENSITY ? CELL_TYPES.WALL : CELL_TYPES.OPEN;
    })
  );

  // Ensure critical positions are open
  const redStart = INITIAL_POSITIONS.RED;
  const blueStart = INITIAL_POSITIONS.BLUE;
  const cheese = INITIAL_POSITIONS.CHEESE;

  newMaze[redStart.y][redStart.x] = CELL_TYPES.OPEN;
  newMaze[blueStart.y][blueStart.x] = CELL_TYPES.OPEN;
  newMaze[cheese.y][cheese.x] = CELL_TYPES.OPEN;

  // Ensure paths exist by doing a connectivity check and opening walls if needed
  ensureConnectivity(newMaze, redStart, cheese, findPathBFS);
  ensureConnectivity(newMaze, blueStart, cheese, findPathBFS);

  return newMaze;
}

/**
 * Ensure connectivity between two points in a maze
 * @param {number[][]} maze - The maze to modify
 * @param {Object} from - Start position {x, y}
 * @param {Object} to - Goal position {x, y}
 * @param {Function} pathfinder - Function to find path (start, goal, maze) => path
 */
export function ensureConnectivity(maze, from, to, pathfinder) {
  const path = pathfinder(from, to, maze);
  if (!path) {
    // Create a simple path by opening walls
    let current = { ...from };
    while (current.x !== to.x || current.y !== to.y) {
      // Move toward target
      if (current.x < to.x) current.x++;
      else if (current.x > to.x) current.x--;
      else if (current.y < to.y) current.y++;
      else if (current.y > to.y) current.y--;
      
      maze[current.y][current.x] = CELL_TYPES.OPEN;
    }
  }
}

/**
 * Check if a position is a valid move (within bounds and open cell)
 * @param {Object} pos - Position {x, y}
 * @param {number[][]} maze - The maze to check
 * @returns {boolean} True if valid move
 */
export function isValidMove(pos, maze) {
  return pos.x >= 0 && pos.x < MAZE_SIZE &&
         pos.y >= 0 && pos.y < MAZE_SIZE &&
         maze[pos.y] && maze[pos.y][pos.x] === CELL_TYPES.OPEN;
}

/**
 * Simple BFS pathfinder for connectivity checks
 * Used internally by maze generation
 * @param {Object} start - Start position {x, y}
 * @param {Object} goal - Goal position {x, y}
 * @param {number[][]} maze - The maze to search
 * @returns {Array|null} Path array or null if no path
 */
function findPathBFS(start, goal, maze) {
  const queue = [{ ...start, path: [start] }];
  const visited = new Set([`${start.x},${start.y}`]);
  const directions = [
    { x: 0, y: 1 }, { x: 1, y: 0 },
    { x: 0, y: -1 }, { x: -1, y: 0 }
  ];
 
  while (queue.length > 0) {
    const current = queue.shift();
    
    if (current.x === goal.x && current.y === goal.y) {
      return current.path;
    }
    
    for (let dir of directions) {
      const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
      const key = `${neighbor.x},${neighbor.y}`;
      
      if (isValidMove(neighbor, maze) && !visited.has(key)) {
        visited.add(key);
        queue.push({
          ...neighbor,
          path: [...current.path, neighbor]
        });
      }
    }
  }
 
  return null;
}

/**
 * Get the default initial maze (hardcoded layout)
 * @returns {number[][]} 2D array representing the maze
 */
export function getInitialMaze() {
  return [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,0,1,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1],
    [1,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
  ];
}
