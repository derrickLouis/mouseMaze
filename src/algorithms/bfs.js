/**
 * Breadth-First Search Algorithm
 * Finds shortest path using level-by-level exploration
 */

import { isValidMove } from '../core/maze.js';
import { DIRECTIONS } from '../core/constants.js';

/**
 * Find path using Breadth-First Search
 * @param {Object} start - Start position {x, y}
 * @param {Object} goal - Goal position {x, y}
 * @param {number[][]} maze - The maze to search
 * @returns {Object[]|null} Path array or null if no path exists
 */
export function findPathBFS(start, goal, maze) {
  const queue = [{ ...start, path: [start] }];
  const visited = new Set([`${start.x},${start.y}`]);
 
  while (queue.length > 0) {
    const current = queue.shift();
    
    if (current.x === goal.x && current.y === goal.y) {
      return current.path;
    }
    
    for (let dir of DIRECTIONS) {
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
