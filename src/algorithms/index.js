/**
 * Pathfinding Algorithms - Unified Interface
 * Provides a single entry point for all pathfinding algorithms
 */

import { findPathBFS } from './bfs.js';
import { findPathAStar } from './astar.js';
import { findPathDFS } from './dfs.js';
import { findPathBidirectional } from './bidirectional.js';

/**
 * Find a path using the specified algorithm
 * @param {string} algorithm - Algorithm type: 'bfs', 'astar', 'dfs', 'bidirectional'
 * @param {Object} start - Start position {x, y}
 * @param {Object} goal - Goal position {x, y}
 * @param {number[][]} maze - The maze to search
 * @returns {Object[]|null} Path array or null if no path exists
 */
export function findPath(algorithm, start, goal, maze) {
  switch (algorithm) {
    case 'bfs':
      return findPathBFS(start, goal, maze);
    case 'astar':
      return findPathAStar(start, goal, maze);
    case 'dfs':
      return findPathDFS(start, goal, maze);
    case 'bidirectional':
      return findPathBidirectional(start, goal, maze);
    default:
      // Default to BFS if unknown algorithm
      return findPathBFS(start, goal, maze);
  }
}

// Export individual algorithms for direct use if needed
export { findPathBFS } from './bfs.js';
export { findPathAStar } from './astar.js';
export { findPathDFS } from './dfs.js';
export { findPathBidirectional } from './bidirectional.js';
