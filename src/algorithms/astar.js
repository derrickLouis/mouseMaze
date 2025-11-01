/**
 * A* Search Algorithm
 * Finds optimal path using heuristic guidance (Manhattan distance)
 */

import { isValidMove } from '../core/maze.js';
import { DIRECTIONS } from '../core/constants.js';

/**
 * Find path using A* Search
 * @param {Object} start - Start position {x, y}
 * @param {Object} goal - Goal position {x, y}
 * @param {number[][]} maze - The maze to search
 * @returns {Object[]|null} Path array or null if no path exists
 */
export function findPathAStar(start, goal, maze) {
  const openSet = [{ ...start, g: 0, h: 0, f: 0, path: [start] }];
  const closedSet = new Set();
 
  // Manhattan distance heuristic
  const heuristic = (pos) => Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
 
  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const key = `${current.x},${current.y}`;
    
    if (closedSet.has(key)) continue;
    closedSet.add(key);
    
    if (current.x === goal.x && current.y === goal.y) {
      return current.path;
    }
    
    for (let dir of DIRECTIONS) {
      const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
      
      if (isValidMove(neighbor, maze) && !closedSet.has(`${neighbor.x},${neighbor.y}`)) {
        const g = current.g + 1;
        const h = heuristic(neighbor);
        const f = g + h;
        
        openSet.push({
          ...neighbor,
          g, h, f,
          path: [...current.path, neighbor]
        });
      }
    }
  }
 
  return null;
}
