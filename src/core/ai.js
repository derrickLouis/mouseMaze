/**
 * AI Strategy and Decision Making
 * Pure functions for evaluating strategic moves and sabotage options
 */

import { findPath } from '../algorithms/index';
import { MAZE_SIZE, MAX_MOVES_PER_TURN } from './constants';

/**
 * Find all removable walls (excluding borders)
 * @param {number[][]} maze - The current maze
 * @returns {Array<{x: number, y: number}>} Array of wall positions
 */
function findRemovableWalls(maze) {
  const removableWalls = [];
  for (let y = 1; y < MAZE_SIZE - 1; y++) {
    for (let x = 1; x < MAZE_SIZE - 1; x++) {
      if (maze[y][x] === 1) {
        removableWalls.push({ x, y });
      }
    }
  }
  return removableWalls;
}

/**
 * Find all valid placement positions for walls
 * @param {number[][]} maze - The current maze
 * @param {{x: number, y: number}} myPos - Current player position
 * @param {{x: number, y: number}} opponentPos - Opponent position
 * @param {{x: number, y: number}} cheesePos - Cheese position
 * @returns {Array<{x: number, y: number}>} Array of valid placement positions
 */
function findValidPlacements(maze, myPos, opponentPos, cheesePos) {
  const validPlacements = [];
  for (let y = 1; y < MAZE_SIZE - 1; y++) {
    for (let x = 1; x < MAZE_SIZE - 1; x++) {
      if (maze[y][x] === 0 &&
          !(x === myPos.x && y === myPos.y) &&
          !(x === opponentPos.x && y === opponentPos.y) &&
          !(x === cheesePos.x && y === cheesePos.y)) {
        validPlacements.push({ x, y });
      }
    }
  }
  return validPlacements;
}

/**
 * Calculate strategic bonuses based on algorithm and game context
 * @param {string} opponentAlgorithm - Opponent's algorithm
 * @param {number} opponentCurrentDist - Opponent's current distance to cheese
 * @param {number} myCurrentDist - Current player's distance to cheese
 * @param {number} tokens - Number of sabotage tokens remaining
 * @returns {number} Bonus score
 */
function calculateStrategicBonuses(opponentAlgorithm, opponentCurrentDist, myCurrentDist, tokens) {
  let algorithmBonus = 0;
  if (opponentAlgorithm === 'astar') {
    algorithmBonus = 2; // A* is predictable, easier to sabotage
  } else if (opponentAlgorithm === 'dfs') {
    algorithmBonus = -1; // DFS is unpredictable, harder to sabotage effectively
  }

  let contextBonus = 0;
  if (opponentCurrentDist <= 3) contextBonus += 5; // Opponent close to winning
  if (myCurrentDist > opponentCurrentDist + 2) contextBonus += 3; // I'm behind
  if (tokens >= 2 && myCurrentDist <= 6) contextBonus += 2; // Endgame with tokens

  return algorithmBonus + contextBonus;
}

/**
 * Evaluate all possible sabotage combinations and return the best option
 * @param {string} player - 'red' or 'blue'
 * @param {{x: number, y: number}} myPos - Current player position
 * @param {{x: number, y: number}} opponentPos - Opponent position
 * @param {{x: number, y: number}} cheesePos - Cheese position
 * @param {number} myCurrentDist - Current player's distance to cheese
 * @param {number} opponentCurrentDist - Opponent's distance to cheese
 * @param {number} tokens - Number of sabotage tokens remaining
 * @param {string} myAlgorithm - Current player's algorithm
 * @param {string} opponentAlgorithm - Opponent's algorithm
 * @param {number[][]} maze - The current maze
 * @param {number} maxEvaluations - Maximum number of combinations to evaluate (default: 200)
 * @returns {Object|null} Best sabotage option or null if none found
 */
export function evaluateAllSabotageOptions(
  player,
  myPos,
  opponentPos,
  cheesePos,
  myCurrentDist,
  opponentCurrentDist,
  tokens,
  myAlgorithm,
  opponentAlgorithm,
  maze,
  maxEvaluations = 200
) {
  if (tokens <= 0) return null;

  const removableWalls = findRemovableWalls(maze);
  const validPlacements = findValidPlacements(maze, myPos, opponentPos, cheesePos);

  let bestOption = null;
  let bestScore = -Infinity;
  let evaluationCount = 0;

  // Evaluate every combination of remove + place
  for (let removeWall of removableWalls) {
    for (let placePos of validPlacements) {
      if (evaluationCount >= maxEvaluations) break;

      // Create test maze
      const testMaze = maze.map(row => [...row]);
      testMaze[removeWall.y][removeWall.x] = 0; // Remove wall
      testMaze[placePos.y][placePos.x] = 1; // Place wall

      // Ensure both mice can still reach cheese
      const myNewPath = findPath(myAlgorithm, myPos, cheesePos, testMaze);
      const opponentNewPath = findPath(opponentAlgorithm, opponentPos, cheesePos, testMaze);

      if (!myNewPath || !opponentNewPath) continue; // Skip if blocks either mouse completely

      const myNewDist = myNewPath.length - 1;
      const opponentNewDist = opponentNewPath.length - 1;

      // Calculate benefits
      const selfBenefit = myCurrentDist - myNewDist; // Positive = shorter path for me
      const opponentHarm = opponentNewDist - opponentCurrentDist; // Positive = longer path for opponent

      // Calculate strategic bonuses
      const bonuses = calculateStrategicBonuses(opponentAlgorithm, opponentCurrentDist, myCurrentDist, tokens);

      // Min-max score: prioritize self-help, then opponent-harm
      const score = (selfBenefit * 3) + (opponentHarm * 2) + bonuses;

      if (score > bestScore) {
        bestScore = score;
        bestOption = {
          remove: removeWall,
          place: placePos,
          score: score,
          selfBenefit: selfBenefit,
          opponentHarm: opponentHarm,
          myNewDist: myNewDist,
          opponentNewDist: opponentNewDist,
          reason: `Self: ${selfBenefit > 0 ? '+' : ''}${selfBenefit}, Opponent: ${opponentHarm > 0 ? '+' : ''}${opponentHarm}`
        };
      }

      evaluationCount++;
    }
    if (evaluationCount >= maxEvaluations) break;
  }

  return bestOption;
}

/**
 * Determine if sabotage is better than moving
 * @param {Object} sabotageOption - Best sabotage option from evaluateAllSabotageOptions
 * @param {number} movementBenefit - How many steps would be gained by moving
 * @returns {boolean} True if sabotage is better than moving
 */
export function shouldSabotageOverMove(sabotageOption, movementBenefit) {
  if (!sabotageOption) return false;

  // Movement benefit: how much closer to cheese we get by moving
  const moveAdvantage = Math.min(MAX_MOVES_PER_TURN, movementBenefit);

  // Sabotage total benefit
  const sabotageAdvantage = sabotageOption.selfBenefit + (sabotageOption.opponentHarm * 0.8);

  // Only sabotage if it provides more total strategic value than moving
  return sabotageAdvantage > moveAdvantage + 1; // +1 threshold for move preference
}
