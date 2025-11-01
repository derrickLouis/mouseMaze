/**
 * Bidirectional Search Algorithm
 * Searches from both start and goal simultaneously
 */

import { isValidMove } from '../core/maze.js';
import { DIRECTIONS } from '../core/constants.js';

/**
 * Find path using Bidirectional Search
 * @param {Object} start - Start position {x, y}
 * @param {Object} goal - Goal position {x, y}
 * @param {number[][]} maze - The maze to search
 * @returns {Object[]|null} Path array or null if no path exists
 */
export function findPathBidirectional(start, goal, maze) {
  if (start.x === goal.x && start.y === goal.y) {
    return [start];
  }

  // Two BFS queues - forward and backward
  const forwardQueue = [{ ...start, path: [start] }];
  const backwardQueue = [{ ...goal, path: [goal] }];
  
  // Visited sets for each direction
  const forwardVisited = new Map();
  const backwardVisited = new Map();
  
  forwardVisited.set(`${start.x},${start.y}`, { ...start, path: [start] });
  backwardVisited.set(`${goal.x},${goal.y}`, { ...goal, path: [goal] });

  while (forwardQueue.length > 0 || backwardQueue.length > 0) {
    // Expand forward search
    if (forwardQueue.length > 0) {
      const current = forwardQueue.shift();
      const currentKey = `${current.x},${current.y}`;
      
      // Check if backward search has visited this node
      if (backwardVisited.has(currentKey)) {
        const backwardNode = backwardVisited.get(currentKey);
        // Combine paths: forward path + reversed backward path
        const combinedPath = [
          ...current.path,
          ...backwardNode.path.slice(0, -1).reverse()
        ];
        return combinedPath;
      }

      // Expand neighbors
      for (let dir of DIRECTIONS) {
        const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        if (isValidMove(neighbor, maze) && !forwardVisited.has(neighborKey)) {
          const neighborNode = { ...neighbor, path: [...current.path, neighbor] };
          forwardVisited.set(neighborKey, neighborNode);
          forwardQueue.push(neighborNode);
        }
      }
    }

    // Expand backward search
    if (backwardQueue.length > 0) {
      const current = backwardQueue.shift();
      const currentKey = `${current.x},${current.y}`;
      
      // Check if forward search has visited this node
      if (forwardVisited.has(currentKey)) {
        const forwardNode = forwardVisited.get(currentKey);
        // Combine paths: forward path + reversed backward path
        const combinedPath = [
          ...forwardNode.path,
          ...current.path.slice(0, -1).reverse()
        ];
        return combinedPath;
      }

      // Expand neighbors
      for (let dir of DIRECTIONS) {
        const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        if (isValidMove(neighbor, maze) && !backwardVisited.has(neighborKey)) {
          const neighborNode = { ...neighbor, path: [...current.path, neighbor] };
          backwardVisited.set(neighborKey, neighborNode);
          backwardQueue.push(neighborNode);
        }
      }
    }
  }
 
  return null;
}
