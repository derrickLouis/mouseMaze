/**
 * Depth-First Search Algorithm
 * Explores deeply before backtracking (may not find shortest path)
 */

import { isValidMove } from '../core/maze.js';
import { DIRECTIONS } from '../core/constants.js';

/**
 * Find path using Depth-First Search
 * @param {Object} start - Start position {x, y}
 * @param {Object} goal - Goal position {x, y}
 * @param {number[][]} maze - The maze to search
 * @returns {Object[]|null} Path array or null if no path exists
 */
export function findPathDFS(start, goal, maze) {
  const stack = [{ ...start, path: [start] }];
  const visited = new Set();
 
  while (stack.length > 0) {
    const current = stack.pop();
    const key = `${current.x},${current.y}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    if (current.x === goal.x && current.y === goal.y) {
      return current.path;
    }
    
    // Shuffle directions for DFS randomness
    const directions = [...DIRECTIONS];
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    for (let dir of directions) {
      const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      if (isValidMove(neighbor, maze) && !visited.has(neighborKey)) {
        stack.push({
          ...neighbor,
          path: [...current.path, neighbor]
        });
      }
    }
  }
 
  return null;
}
